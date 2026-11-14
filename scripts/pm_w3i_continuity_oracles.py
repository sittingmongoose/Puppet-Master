#!/usr/bin/env python3
"""W3I wave-3 phase 2 (fix 1): the complete continuity lane checker.

Four NEWLY AUTHORED families (CV-1600..1603, SP-1600..1603, OSI-1600..1603,
ATS-1280..1283), prepared without admission.

Structure (Method B, after W3F phase 2):
- ROWS below is the guard table. Every row is ONE predicate over one subject.
  Its decision code is generated from the row's template into
  scripts/pm_w3i_table_<table>.py by scripts/pm-w3i-table-generate.py; those
  table modules are what the gated guard tool (scripts/pm_guard_isolation.py,
  004bdedd63) scans and cuts.
- The checker refuses ONLY through those table predicates (evaluate()): for a
  boundary it projects each row's inputs from the complete case, calls the
  table predicates in table order, and the refusals they return are its result.
- A row's inputs are the presented field values and the independently derived
  reference values they are compared with (recomputed identities, Storage's
  own record, the resolved original source), or a shared helper's own result
  where the rule IS the shared helper (owner schema validation with the shared
  CV-1101 format checker, pm_event_datetime.date_time, storage_uint64,
  storage_value_bytes, verify_payload_bytes, RetainedDispatcher). An input is
  never a row verdict.
- 'applies' is the row's precondition: its family, and readiness gates (an
  earlier row owns a malformed input). Gates are derived from the case, never
  from table results, so a cut table row changes only that row.

Owner rules are validated with the full owner schemas (pattern, format, not,
the checkpoint state allOf all kept) and the shared CV-1101 format checker;
named rows restore what Python's validator cannot see: a `$`-anchored pattern
without a CR/LF guard accepts a trailing LF, and the 'uuid' format is not in
the shared checker.

No lane-local number cap, serializer or timestamp parser. No admission, no
registry append, no native execution. Deterministic: no clock, network,
randomness or machine-dependent input.
"""
import base64
import copy
import functools
import hashlib
import importlib
import json
import re
import sys
from pathlib import Path

import blake3

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))

from jsonschema import Draft202012Validator  # noqa: E402
from referencing import Registry, Resource  # noqa: E402
from referencing.jsonschema import DRAFT202012  # noqa: E402

import pm_event_numbers  # noqa: E402
from pm_event_numbers import (  # noqa: E402
    EVENT_VALUE, Refusal, JsonNumber,
    storage_uint64, current_append_policy, loads_current_json, qualified_jcs,
    producer_semantic_digest, storage_value_bytes, decode_storage_value, full_value_commitment,
    verify_payload_bytes,
    RecipeTuple, OriginalBinding, OriginalCustody, FrozenRecipe, RetainedDispatcher,
)
from pm_event_datetime import date_time, format_checker, EVENT_RECORD, STORAGE_UTC_Z  # noqa: E402

TABLE_PREFIX = 'pm_w3i_table_'
FAMILIES = (
    'continuity.actor_identified',
    'continuity.provenance_recorded',
    'continuity.redaction_applied',
    'continuity.replay_checkpointed',
)
PAYLOAD_SCHEMA_IDS = {f: 'pm.' + f + '.payload.v1' for f in FAMILIES}
PAYLOAD_DEFS = {f: f.split('.', 1)[1] for f in FAMILIES}
PRODUCERS = {f: 'orchestrator.continuity_' + f.split('.', 1)[1] + '.v1@1.0.0' for f in FAMILIES}
PROJECTOR_ID = 'storage.continuity_projector.v1'
PROJECTOR_VERSION = '1.0.0'

PROJECT_ID = 'p-w3i'
STREAM_ID = 's-w3i-main'
STORAGE_INSTANCE_ID = '3f2a9c1e-7b4d-4e8a-9c1f-5d6e7a8b9c0d'
SERVER_ID = 'server-w3i'
SOURCE_TIME = '2026-11-05T10:00:00Z'
OBSERVED_TIME = '2026-11-05T10:00:01.123456789Z'
PERSISTED_TIME = '2026-11-05T10:00:02Z'
ACK_TIME = '2026-11-05T10:00:03Z'
WITHDRAW_TIME = '2026-11-06T09:00:00Z'
INLINE_LIMIT = 16384
UINT64_MAX = (1 << 64) - 1
PACK_MEDIA = 'application/json'
CHECKPOINT_KEY_PREFIX = 'event_record_index_checkpoint.v1:'
DATASET_PREFIX = 'event_record_index.v2@'


def partition_of(project_id):
    """CV-1600: scope_partition = project~base64url_no_pad(UTF8(project_id))."""
    return 'project~' + base64.urlsafe_b64encode(project_id.encode('utf-8')).decode('ascii').rstrip('=')


SCOPE_PARTITION = partition_of(PROJECT_ID)

# ---- Owner schemas, validated in full with the shared CV-1101 format checker -------------------------------------


def _load(name):
    return json.loads((ROOT / 'Plans' / name).read_text())


CONTINUITY_SCHEMA = _load('continuity_event_contracts.schema.json')
EVENT_RECORD_SCHEMA = _load('event_record.schema.json')
RECEIPT_SCHEMA = _load('event_append_receipt_contracts.schema.json')
CONTINUITY_ID = CONTINUITY_SCHEMA['$id']
EVENT_RECORD_ID = EVENT_RECORD_SCHEMA['$id']
RECEIPT_ID = RECEIPT_SCHEMA['$id']
REGISTRY = Registry().with_resources([
    (CONTINUITY_ID, Resource.from_contents(CONTINUITY_SCHEMA, default_specification=DRAFT202012)),
    (EVENT_RECORD_ID, Resource.from_contents(EVENT_RECORD_SCHEMA, default_specification=DRAFT202012)),
    (RECEIPT_ID, Resource.from_contents(RECEIPT_SCHEMA, default_specification=DRAFT202012)),
])
# CV-1101: the shared helper's explicitly registered date-time predicate. Every owner date-time format in these
# resources (EventRecord date_time_string, continuity $defs/timestamp, AppendReceipt acknowledged_at_utc) is the
# broad EventRecord profile; Storage's observed/persisted times add CV-253 storage_utc_z at their own rows.
DATETIME_FORMATS = format_checker(profile=EVENT_RECORD)


@functools.lru_cache(maxsize=None)
def _validator(root_id, pointer):
    ref = root_id + (('#' + pointer) if pointer else '')
    return Draft202012Validator({'$ref': ref}, registry=REGISTRY, format_checker=DATETIME_FORMATS)


def schema_errors(root_id, pointer, value):
    """Full owner validation (every keyword, every format the shared checker owns). Callers run it only on a value
    that encodes physically (SP-1100), so no integer exceeds Python's conversion limit and nothing is translated."""
    return sorted('/'.join(str(p) for p in e.absolute_path) + ':' + str(e.validator)
                  for e in _validator(root_id, pointer).iter_errors(value))


def eager_refs(schema):
    """Resolve every $ref eagerly, including dormant definitions (standing check 9)."""
    resolver = REGISTRY.resolver_with_root(Resource.from_contents(schema, default_specification=DRAFT202012))
    count = 0

    def walk(node):
        nonlocal count
        if isinstance(node, dict):
            if '$ref' in node:
                resolver.lookup(node['$ref'])
                count += 1
            for v in node.values():
                walk(v)
        elif isinstance(node, list):
            for v in node:
                walk(v)
    walk(schema)
    return count


def _owner_pattern(*path):
    node = CONTINUITY_SCHEMA['$defs']
    for part in path:
        node = node[part]
    pattern = node['pattern']
    assert pattern.startswith('^') and pattern.endswith('$') and 'not' not in node, path
    return re.compile(pattern[1:-1], re.ASCII)


# The owner's own `$`-anchored patterns that carry no CR/LF guard (Python's `$` also matches before a final LF),
# read from the owner schema, applied in full. `$defs/id` carries `not: [\r\n]`, so the schema already refuses LF.
TOKEN_PROPS = ('durable_read_token', 'properties')
SELECTION_PROPS = TOKEN_PROPS + ('source_selection', 'properties')
GENERATION_ID_RE = _owner_pattern(*TOKEN_PROPS, 'generation_id')
HEX64_RE = _owner_pattern(*TOKEN_PROPS, 'frontier_sha256')
SEGMENT_NAME_RE = _owner_pattern('checkpoint', 'properties', 'source_cursor', 'anyOf', 0, 'properties', 'segment_name')
RECEIPT_HEX_RE = re.compile(RECEIPT_SCHEMA['$defs']['custody_v2']['properties']['group_digest']['pattern'][1:-1], re.ASCII)
# JSON Schema 'uuid' (RFC 4122 string form; hex is case-insensitive on input). The shared format checker is a full
# jsonschema FormatChecker, so 'uuid' runs, but its check is uuid.UUID() plus four hyphen positions, which accepts a
# trailing '}', an extra hyphen, '+' and '_' (int() syntax). The owner's two uuid formats are restored in full here.
UUID_RE = re.compile(r'[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}', re.ASCII)
HEX_FIELDS = (('generation_anchor_sha256', 'frontier_sha256') +
              tuple('selection.' + f for f in ('current_bytes_sha256', 'manifest_bytes_sha256',
                                               'manifest_survivor_prefix_sha256', 'retained_inventory_sha256',
                                               'durable_watermarks_sha256', 'excluded_ranges_sha256',
                                               'retired_inputs_sha256')))
for _f in HEX_FIELDS:
    _path = (SELECTION_PROPS + (_f.split('.')[1],)) if _f.startswith('selection.') else (TOKEN_PROPS + (_f,))
    assert _owner_pattern(*_path).pattern == HEX64_RE.pattern, _f


def fullmatch(regex, value):
    return type(value) is str and regex.fullmatch(value) is not None


# ---- Shared-rule wrappers: the refusal reason or None (never a verdict) ------------------------------------------

def reason_of(fn, *args, **kwargs):
    try:
        fn(*args, **kwargs)
        return None
    except Refusal as refusal:
        return refusal.reason


def physical_reason(value):
    return reason_of(storage_value_bytes, value, profile=EVENT_VALUE)


def pack_value(value):
    return storage_value_bytes(value, profile=EVENT_VALUE)


def identity(event_type, payload):
    """CV-1600..1603: RFC 8785 of the ordered string tuple, SHA-256, exact prefixes."""
    tuple_ = [event_type, payload['project_id'], payload['continuity_id'], payload['source_event_id'],
              payload['fact_ref']]
    digest = hashlib.sha256(qualified_jcs(tuple_)).hexdigest()
    return 'continuity@1:' + digest, 'evt_continuity_' + digest


def _hex(label):
    return hashlib.sha256(label.encode('utf-8')).hexdigest()


def _structural_digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, ensure_ascii=True, separators=(',', ':')).encode()).hexdigest()


# Structural fingerprint of the frozen resources (schema bounds carry uint64 values beyond binary64, so this is not
# a JCS preimage).
RESOURCE_MANIFEST_SHA256 = _structural_digest({'continuity': CONTINUITY_SCHEMA, 'event_record': EVENT_RECORD_SCHEMA,
                                               'receipt': RECEIPT_SCHEMA})
RECIPE_FIELDS = ('envelope_schema_id', 'envelope_schema_version', 'payload_schema_id', 'payload_schema_version',
                 'owner_source_id', 'owner_edition', 'registry_revision', 'identity_recipe', 'producer_recipe',
                 'physical_profile', 'full_value_profile', 'local_source_profile', 'payload_profile',
                 'resource_manifest_sha256')
BINDING_FIELDS = ('storage_instance_id', 'scope_kind', 'server_id', 'project_id', 'event_type', 'event_id',
                  'idempotency_key', 'owner_operation_id', 'source_commitment')


def recipe_tuple(family):
    return RecipeTuple(
        envelope_schema_id='pm.event.v0', envelope_schema_version='2.0.0',
        payload_schema_id=PAYLOAD_SCHEMA_IDS[family], payload_schema_version='1.0.0',
        owner_source_id=PRODUCERS[family], owner_edition='project-orchestration-v1',
        registry_revision='w3i-prepared-no-admission',
        identity_recipe='continuity-string-tuple-rfc8785-sha256-v1',
        producer_recipe='cv-317-producer-semantic-v1',
        physical_profile=EVENT_VALUE,
        full_value_profile='pm.storage.original_event_value_commitment.v1',
        local_source_profile='orchestrator-continuity-observation-v1',
        payload_profile='pm.continuity.payload.v1',
        resource_manifest_sha256=RESOURCE_MANIFEST_SHA256,
    )


# ---- Deterministic builders ----------------------------------------------------------------------------------------

def build_source(family):
    """The independently resolved original owner observation (OSI-1600..1603). Live: it can change after the
    write, and only the append boundary reads it."""
    source_event_id = 'evt_source_' + _hex(family + ':source-original')
    return {
        'resolved': True,
        'source_event_id': source_event_id,
        'durably_issued': True,
        'project_id': PROJECT_ID,
        'stream_id': STREAM_ID,
        'principal': 'user:w3i-source-actor',
        'principal_kind': 'human',
        'provenance_ref': 'prov:w3i-output-v1',
        'provenance_names_source': True,
        'redaction_profile_id': 'rp:w3i-standard',
        'redaction_decision': 'applied',
        'redaction_transform_version': 'transform-v1',
        'created_at_utc': SOURCE_TIME,
        'thread_id': None,
        'run_id': 'run-w3i-1',
        'node_id': None,
        'attempt_id': None,
        'requested_account_ref': None,
        'effective_account_ref': None,
        'upstream_checkpoint': {
            'checkpoint_ref': 'checkpoint:upstream-w3i-1',
            'is_downstream': False,
            'token_storage_instance_id': STORAGE_INSTANCE_ID,
            'prefix_event_ids': [source_event_id],
            'prefix_complete': True,
        },
    }


def build_payload(family, source, continuity_id, fact_ref):
    payload = {
        'project_id': source['project_id'],
        'continuity_id': continuity_id,
        'stream_id': source['stream_id'],
        'fact_ref': fact_ref,
        'actor_ref': source['principal'],
        'actor_kind': source['principal_kind'],
        'source_event_id': source['source_event_id'],
        'provenance_ref': source['provenance_ref'],
        'redaction_profile_id': source['redaction_profile_id'],
        'redaction_decision': source['redaction_decision'],
        'created_at_utc': source['created_at_utc'],
        'schema_id': PAYLOAD_SCHEMA_IDS[family],
        'schema_version': '1.0.0',
    }
    if family == 'continuity.replay_checkpointed':
        payload['replay_checkpoint_ref'] = source['upstream_checkpoint']['checkpoint_ref']
    return payload


def build_envelope(family, payload, source, event_id, key, sequence_id):
    return {
        'schema_id': 'pm.event.v0',
        'schema_version': '2.0.0',
        'scope_kind': 'project',
        'event_id': event_id,
        'event_type': family,
        'project_id': payload['project_id'],
        'thread_id': source['thread_id'],
        'run_id': source['run_id'],
        'node_id': source['node_id'],
        'attempt_id': source['attempt_id'],
        'actor_ref': 'user:w3i-continuity-observer',
        'requested_account_ref': source['requested_account_ref'],
        'effective_account_ref': source['effective_account_ref'],
        'occurred_at_utc': payload['created_at_utc'],
        'observed_at_utc': OBSERVED_TIME,
        'persisted_at_utc': PERSISTED_TIME,
        'sequence_id': sequence_id,
        'producer_sequence_id': None,
        'correlation_id': payload['continuity_id'],
        'causation_event_id': payload['source_event_id'],
        'parent_event_id': payload['source_event_id'],
        'idempotency_key': key,
        'payload_schema_id': PAYLOAD_SCHEMA_IDS[family],
        'payload': copy.deepcopy(payload),
        'payload_ref': None,
        'redaction_profile': 'no_secrets',
        'replay_policy': 'dedupe_by_idempotency_key',
        'migration': {
            'migrated_from_schema_id': None,
            'migrated_from_schema_version': None,
            'migration_id': None,
            'compatibility_event_type': None,
        },
    }


RECEIPT_FIELDS = ('event_id', 'sequence_id', 'segment_generation', 'segment_name', 'byte_offset', 'commit_group_id',
                  'durability_class', 'durable_end_offset', 'durability_state', 'manifest_generation',
                  'acknowledged_at_utc')
RECEIPT_SLOTS = ('sequence_id', 'segment_generation', 'byte_offset', 'durable_end_offset', 'manifest_generation')


def build_storage_record(event):
    """Storage's own assigned record (authority). Built once with the event; resync never rebuilds it."""
    return {
        'event_id': event['event_id'],
        'sequence_id': event['sequence_id'],
        'segment_generation': 1,
        'segment_name': 'seg-000001-00000000000000000041.active',
        'byte_offset': 0,
        'commit_group_id': 'group-w3i-1',
        'durability_class': 'barrier',
        'durable_end_offset': 1240,
        'durability_state': 'synced',
        'manifest_generation': 11,
        'acknowledged_at_utc': ACK_TIME,
        'observed_at_utc': event['observed_at_utc'],
        'persisted_at_utc': event['persisted_at_utc'],
    }


def build_custody_receipt(event, record, scope_partition):
    return {
        'schema_id': 'pm.storage_value.event_append_receipt_custody.v2',
        'schema_version': '2.0.0',
        'original_event_value_commitment': {
            'schema_id': 'pm.storage.original_event_value_commitment.v1',
            'schema_version': '1.0.0',
            'codec': EVENT_VALUE,
            'domain': 'pm.storage.original_event_value_commitment.v1',
            'event_schema_id': 'pm.event.v0',
            'event_schema_version': '2.0.0',
            'sha256': full_value_commitment(event),
        },
        'storage_instance_id': STORAGE_INSTANCE_ID,
        'event_id': event['event_id'],
        'scope_partition': scope_partition,
        'event_type': event['event_type'],
        'idempotency_key': event['idempotency_key'],
        'producer_semantic_digest': producer_semantic_digest(event),
        'group_digest': _hex('w3i-group:' + str(event['event_id'])),
        'first_append_receipt': {k: record[k] for k in RECEIPT_FIELDS},
        'redaction_profile': 'no_secrets',
        'original_segment_ref': 'segment:w3i-original-1',
    }


def original_binding(event):
    return OriginalBinding(
        storage_instance_id=STORAGE_INSTANCE_ID, scope_kind='project', server_id=SERVER_ID,
        project_id=PROJECT_ID, event_type=event['event_type'], event_id=event['event_id'],
        idempotency_key=event['idempotency_key'],
        owner_operation_id='continuity-observation:' + event['payload']['fact_ref'],
        source_commitment=full_value_commitment(event),
    )


def append_result(event):
    return {'schema_id': 'pm.storage_value.continuity_append_result.v1', 'schema_version': '1.0.0',
            'event_id': event['event_id'], 'sequence_id': event['sequence_id'], 'status': 'appended'}


def original_ref_of(event):
    return 'original:' + str(event['event_id'])


def build_sealed_receipt(event, custody, family):
    """The independently sealed receipt Storage wrote for one exact original. Reading never creates one."""
    binding = original_binding(event)
    recipe = recipe_tuple(family)
    return {
        'original_ref': original_ref_of(event),
        'binding': {f: getattr(binding, f) for f in BINDING_FIELDS},
        'recipe': {f: getattr(recipe, f) for f in RECIPE_FIELDS},
        'record_hex': pack_value(event).hex(),
        'result_hex': pack_value(append_result(event)).hex(),
        'receipt_hex': pack_value(custody).hex(),
    }


def build_read_token(sequence_id, frontier_sha256, label='1'):
    generation_id = 'eig_' + _hex('w3i-generation-' + label)
    return {
        'storage_instance_id': STORAGE_INSTANCE_ID,
        'checkpoint_key': CHECKPOINT_KEY_PREFIX + STORAGE_INSTANCE_ID,
        'checkpoint_ref': 'checkpoint:' + generation_id,
        'generation_id': generation_id,
        'generation_anchor_sha256': _hex('w3i-anchor-' + label),
        'frontier_revision': sequence_id,
        'frontier_sha256': frontier_sha256,
        'index_dataset_name': DATASET_PREFIX + generation_id,
        'source_selection': {
            'storage_instance_id': STORAGE_INSTANCE_ID,
            'current_ref': 'storage/seglog/CURRENT',
            'current_bytes_sha256': _hex('w3i-current-' + label),
            'selected_segment_generation': 1,
            'manifest_ref': 'storage/seglog/manifest.v1.msgpack',
            'manifest_bytes_sha256': _hex('w3i-manifest-' + label),
            'manifest_generation': 11,
            'recovery_epoch': 3,
            'manifest_survivor_prefix_sha256': _hex('w3i-survivor-prefix-' + label),
            'retained_inventory_sha256': _hex('w3i-retained-inventory-' + label),
            'durable_watermarks_sha256': _hex('w3i-watermarks-' + label),
            'excluded_ranges_sha256': _hex('w3i-excluded-ranges-' + label),
            'retired_inputs_sha256': _hex('w3i-retired-inputs-' + label),
        },
    }


def build_projection(event, publication_id):
    payload = event['payload']
    return {
        'schema_id': 'pm.storage_value.continuity_record.v1',
        'schema_version': '1.0.0',
        'project_id': payload['project_id'],
        'continuity_id': payload['continuity_id'],
        'stream_id': payload['stream_id'],
        'event_type': event['event_type'],
        'event_id': event['event_id'],
        'sequence_id': event['sequence_id'],
        'publication_id': publication_id,
        'body_event_id': event['event_id'],
    }


def build_checkpoint(event, publication_id, frontier_sha256, retired=()):
    return {
        'schema_id': 'pm.storage_value.continuity_replay_checkpoint.v1',
        'schema_version': '1.0.0',
        'projector_id': PROJECTOR_ID,
        'projector_version': PROJECTOR_VERSION,
        'storage_instance_id': STORAGE_INSTANCE_ID,
        'project_id': event['project_id'],
        'stream_id': event['payload']['stream_id'],
        'publication_id': publication_id,
        'admitted_event_types': [event['event_type']],
        'index_read_token': build_read_token(event['sequence_id'], frontier_sha256),
        'index_through_sequence_id': event['sequence_id'],
        'source_cursor': {
            'segment_generation': 1,
            'segment_name': 'seg-000001-00000000000000000041.active',
            'byte_offset': 0,
            'frame_end_offset': 1240,
            'last_sequence_id': event['sequence_id'],
            'last_event_id': event['event_id'],
        },
        'filter_complete': True,
        'state': 'current',
        'withdrawn_at_utc': None,
        'retired_publications': copy.deepcopy(list(retired)),
        'hold_refs': [],
    }


def build_retired_core(family, label):
    """A withdrawn earlier publication of the same checkpoint key, holding its own original token."""
    sequence_id = 30 + int(label)
    core = {
        'schema_id': 'pm.storage_value.continuity_replay_checkpoint.v1',
        'schema_version': '1.0.0',
        'projector_id': PROJECTOR_ID,
        'projector_version': PROJECTOR_VERSION,
        'storage_instance_id': STORAGE_INSTANCE_ID,
        'project_id': PROJECT_ID,
        'stream_id': STREAM_ID,
        'publication_id': 'pub-w3i-retired-' + label,
        'admitted_event_types': [family],
        'index_read_token': build_read_token(sequence_id, _hex('w3i-frontier-retired-' + label), 'retired-' + label),
        'index_through_sequence_id': sequence_id,
        'source_cursor': {
            'segment_generation': 1,
            'segment_name': 'seg-000001-00000000000000000030-00000000000000000040.seglog',
            'byte_offset': 100,
            'frame_end_offset': 900,
            'last_sequence_id': sequence_id,
            'last_event_id': 'evt_continuity_' + _hex('w3i-retired-event-' + label),
        },
        'filter_complete': True,
        'state': 'withdrawn',
        'withdrawn_at_utc': WITHDRAW_TIME,
        'hold_refs': ['hold:w3i-retired-' + label],
    }
    return core


def build_case(family, case_id, sequence_id=41):
    """One complete valid case: original observation, envelope, Storage record, custody, sealed store, derived
    row and checkpoint, plus the boundary state inputs."""
    source = build_source(family)
    continuity_id = 'cont-w3i-' + PAYLOAD_DEFS[family]
    fact_ref = 'fact:w3i:' + PAYLOAD_DEFS[family] + '-v1'
    payload = build_payload(family, source, continuity_id, fact_ref)
    key, event_id = identity(family, payload)
    event = build_envelope(family, payload, source, event_id, key, sequence_id)
    case = {
        'case_id': case_id,
        'family': family,
        'live': {'admitted': True},
        'source': source,
        'event': event,
        'storage_record': build_storage_record(event),
        'scope_partition': SCOPE_PARTITION,
        'frontier_sha256': None,
        'dedupe_caught_up': True,
        'prior_publication_id': 'pub-w3i-0',
        'cas_expected': 'pub-w3i-0',
        'transaction_committed': True,
        'family_withdrawn': False,
        'original_withdrawn': False,
        'disclosure_allowed': True,
        'retained_recipe_override': None,
        'owner_impl': 'sealed_store',
        'frozen_map': 'installed',
        'rebuild_matches': True,
        'replay_effects': [],
        'writer_cutoff_applied': True,
        'withdrawal_marks': 1,
        'reader_fenced': True,
        'successor_verified': True,
        'reported_outcome': 'success',
        'actual_outcome': 'success',
        'retry_sequence_unchanged': True,
        'payload_pack': None,
        'publication_id': 'pub-w3i-1',
        'retired': [],
    }
    return resync(case)


def resync(case, recompute_identity=True):
    """Recompute every dependent copy from the authorities (the event, Storage's record, the source): identity
    (optional), custody, sealed store, retry candidate and returned receipt, projection and checkpoint. Storage's
    record and the source observation are never rebuilt here: they are the independent authority."""
    event = case['event']
    payload = event.get('payload')
    family = case['family']
    if recompute_identity and type(payload) is dict and family in FAMILIES and all(
            type(payload.get(f)) is str for f in ('project_id', 'continuity_id', 'source_event_id', 'fact_ref')):
        key, event_id = identity(family, payload)
        event['idempotency_key'] = key
        event['event_id'] = event_id
        case['storage_record']['event_id'] = event_id
    record = case['storage_record']
    try:
        custody = build_custody_receipt(event, record, case['scope_partition'])
        case['custody_receipt'] = custody
        case['sealed_store'] = [build_sealed_receipt(event, custody, family)]
        case['original_ref'] = case['sealed_store'][0]['original_ref']
        case['retry_returned_receipt_hex'] = case['sealed_store'][0]['receipt_hex']
    except (Refusal, KeyError, TypeError):
        # The changed value cannot be committed (the shared codec refuses it, or a dependent field is missing).
        # Keep the copies Storage would have written consistent field by field, so only the row that owns the
        # changed value refuses.
        custody = case.get('custody_receipt') or {}
        custody['first_append_receipt'] = {k: record.get(k) for k in RECEIPT_FIELDS}
        custody['event_id'] = event.get('event_id')
        custody['idempotency_key'] = event.get('idempotency_key')
        custody['event_type'] = event.get('event_type')
        custody['scope_partition'] = case['scope_partition']
        case['custody_receipt'] = custody
        case.setdefault('sealed_store', [])
        case.setdefault('original_ref', original_ref_of(event))
        case.setdefault('retry_returned_receipt_hex', None)
    case['retry_event'] = copy.deepcopy(event)
    if type(payload) is dict and all(k in payload for k in ('project_id', 'continuity_id', 'stream_id')):
        case['projection'] = build_projection(event, case['publication_id'])
        frontier = _hex('w3i-frontier:' + str(event.get('event_id')))
        case['frontier_sha256'] = frontier
        case['checkpoint'] = build_checkpoint(event, case['publication_id'], frontier, case['retired'])
    return case


def with_pack(case):
    """Externalize the event body through SP-337: an immutable BLAKE3 payload pack and exact payload_ref. The
    logical body and semantic digest are unchanged; the pack holds its canonical SP-236 bytes."""
    raw = pack_value(case['event']['payload'])
    payload_id = blake3.blake3(raw).digest().hex()
    case['payload_pack'] = {'raw_hex': raw.hex(), 'byte_size': len(raw), 'payload_id': payload_id,
                            'media_type': PACK_MEDIA}
    case['event']['payload_ref'] = 'blake3:' + payload_id
    return resync(case)


LONG_FRACTION_TIME = '2026-11-05T10:00:00.' + '0' * 20000 + 'Z'


def set_source_time(case, value):
    """The original source occurrence time and its copies: payload created_at_utc (CV-1600) and the envelope
    occurred_at_utc (= created_at_utc)."""
    case['source']['created_at_utc'] = value
    case['event']['payload']['created_at_utc'] = value
    case['event']['occurred_at_utc'] = value


def set_storage_time(case, field, value):
    """A Storage-assigned time as Storage assigned it: its own record and the event carry the same value."""
    case['storage_record'][field] = value
    case['event'][field] = value


def set_sequence(case, value):
    case['storage_record']['sequence_id'] = value
    case['event']['sequence_id'] = value


# ---- Retained reads: SP-1101 sealed-receipt dispatch -------------------------------------------------------------

SEALED_KEYS = ('original_ref', 'binding', 'recipe', 'record_hex', 'result_hex', 'receipt_hex')


def _custody_from_sealed(sealed):
    """Build the authenticated original from one sealed store row; a malformed row refuses with a code. A binding or
    recipe member of the wrong type or value makes the shared constructors refuse (RecipeTuple: recipe_tuple,
    recipe_resource_hash; OriginalBinding: original_binding, original_scope; scripts/pm_event_numbers.py:442-485).
    Those are defects of the sealed row itself, so they refuse here as sealed_receipt_malformed."""
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
    return OriginalCustody(
        binding=binding, recipe=recipe,
        record_bytes=bytes.fromhex(sealed['record_hex']), result_bytes=bytes.fromhex(sealed['result_hex']),
        receipt_bytes=bytes.fromhex(sealed['receipt_hex']))


class SealedReceiptOwner:
    """Resolves the sealed receipt for one exact original_ref from Storage's sealed store. Trusted composition: it
    reads the store, never a caller-supplied custody object, and never writes it."""

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
    """A faulty owner composition (negative only): it writes an access receipt into the sealed store while
    resolving. The store snapshot row refuses it; no fixture field reports it."""

    def authenticated_original(self, original_ref):
        original = super().authenticated_original(original_ref)
        logged = copy.deepcopy(self._store[0])
        logged['original_ref'] = 'access-log:' + original_ref
        self._store.append(logged)
        return original


OWNERS = {'sealed_store': SealedReceiptOwner, 'access_logging': AccessLoggingOwner}


def frozen_components(custody):
    """The frozen continuity@1 verifier's checks over the sealed original, each its own (presented, expected) pair
    or shared-helper result. A component is computed only when the components it depends on hold, so one defect
    yields one failing component. Only the sealed bytes and the sealed recipe are read: no live source, no live
    admission, no current writer gate."""
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
    commitment = full_value_commitment(record)
    out['source_commitment'] = (custody.binding.source_commitment, commitment)
    out['result_event_id'] = (result.get('event_id'), record['event_id'])
    out['receipt_schema'] = schema_errors(RECEIPT_ID, '/$defs/custody_v2', receipt)
    if not out['receipt_schema']:
        out['receipt_full_value'] = (receipt['original_event_value_commitment']['sha256'], commitment)
        out['receipt_event_id'] = (receipt['event_id'], record['event_id'])
    if out['family']:
        out['payload_schema_id'] = (record['payload_schema_id'], PAYLOAD_SCHEMA_IDS[family])
        out['payload_schema'] = schema_errors(CONTINUITY_ID, '/$defs/' + PAYLOAD_DEFS[family], record['payload'])
        if not out['payload_schema']:
            key, event_id = identity(family, record['payload'])
            out['identity'] = (record['event_id'], event_id)
            out['key'] = (record['idempotency_key'], key)
            if not out['receipt_schema']:
                try:
                    semantic = producer_semantic_digest(record)
                except Refusal as refusal:
                    semantic = 'unqualified:' + refusal.reason   # a forged original whose projection cannot qualify
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
    """continuity@1 frozen verifier: every component holds. Exactly the conjunction of the frozen rows."""
    components = frozen_components(custody)
    return all(component_holds(name, value) for name, value in components.items())


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


REQUEST_STRINGS = ('event_type', 'event_id', 'idempotency_key')


def retained_request(event):
    """The expected binding of the original the read asks for, or None when the request cannot name one original
    (its shape is wrong, or the shared full-value commitment refuses it, e.g. another envelope edition). None goes to
    the shared dispatcher, which refuses it as original_query itself."""
    if (type(event) is not dict or any(type(event.get(k)) is not str for k in REQUEST_STRINGS)
            or type(event.get('payload')) is not dict or type(event['payload'].get('fact_ref')) is not str):
        return None
    try:
        return original_binding(event)
    except Refusal:
        return None


def resolve_retained(case):
    """One SP-1101 resolution through the shared RetainedDispatcher, instrumented: the sealed store is snapshotted
    before and after, and every call of the shared current writer gate during the read is counted."""
    store = case['sealed_store']
    before = _structural_digest(store)
    owner = _RecordingOwner(OWNERS[case['owner_impl']](store))
    recipes = FROZEN_MAPS[case['frozen_map']]
    calls = []
    real = pm_event_numbers.current_append_policy
    module = sys.modules[__name__]

    def counting(value):
        calls.append(value)
        return real(value)
    pm_event_numbers.current_append_policy = counting
    module.current_append_policy = counting
    try:
        expected = retained_request(case['event'])
        RetainedDispatcher(owner, recipes).resolve(
            case['original_ref'], expected,
            disclose=lambda binding: case['disclosure_allowed'] is True,
            recipe_override=case['retained_recipe_override'])
        reason = None
    except Refusal as refusal:
        reason = refusal.reason
    finally:
        pm_event_numbers.current_append_policy = real
        module.current_append_policy = real
    after = _structural_digest(store)
    return {'reason': reason, 'store_before': before, 'store_after': after, 'gate_calls': len(calls),
            'seen': owner.seen}


# ---- Per-case derivations (decide nothing; rows read them) -------------------------------------------------------

class Memo:
    def __init__(self, case):
        self.case, self.values = case, {}

    def get(self, name):
        if name not in self.values:
            self.values[name] = DERIVED[name](self.case, self)
        return self.values[name]


DERIVED = {}


def derived(fn):
    DERIVED[fn.__name__] = fn
    return fn


def E(c):
    return c['event']


def P(c):
    return c['event']['payload']


def CK(c):
    return c['checkpoint']


def TOK(c):
    return c['checkpoint']['index_read_token']


def SEL(c):
    return c['checkpoint']['index_read_token']['source_selection']


def CUR(c):
    return c['checkpoint']['source_cursor']


def RET(c):
    return c['checkpoint']['retired_publications']


@derived
def fam(c, m):
    return c['family'] in FAMILIES and type(c['event']) is dict


@derived
def seq_ok(c, m):
    return m.get('fam') and ('sequence_id' not in E(c) or reason_of(storage_uint64, E(c)['sequence_id']) is None)


@derived
def phys_ok(c, m):
    return m.get('seq_ok') and physical_reason(E(c)) is None


@derived
def env_errors(c, m):
    return schema_errors(EVENT_RECORD_ID, '', E(c))


@derived
def env_ok(c, m):
    return m.get('phys_ok') and m.get('env_errors') == []


@derived
def pay_errors(c, m):
    return schema_errors(CONTINUITY_ID, '/$defs/' + PAYLOAD_DEFS[c['family']], P(c))


@derived
def pay_ok(c, m):
    return m.get('env_ok') and m.get('pay_errors') == []


@derived
def project_scope(c, m):
    return m.get('env_ok') and E(c)['scope_kind'] == 'project'


@derived
def recomputed(c, m):
    return identity(c['family'], P(c))


@derived
def not_self(c, m):
    return m.get('pay_ok') and P(c)['source_event_id'] != E(c)['event_id']


@derived
def digest(c, m):
    try:
        return producer_semantic_digest(E(c))
    except Refusal:
        return None


@derived
def full_value(c, m):
    try:
        return full_value_commitment(E(c))
    except Refusal:
        return None


@derived
def policy_reason(c, m):
    return reason_of(current_append_policy, E(c)['replay_policy'])


def _receipt(c):
    custody = c.get('custody_receipt')
    receipt = custody.get('first_append_receipt') if type(custody) is dict else None
    return receipt if type(receipt) is dict else None


@derived
def custody_slots_ok(c, m):
    receipt = _receipt(c)
    return receipt is None or all(reason_of(storage_uint64, receipt[k]) is None for k in RECEIPT_SLOTS if k in receipt)


@derived
def custody_phys_ok(c, m):
    return m.get('custody_slots_ok') and physical_reason(c.get('custody_receipt')) is None


@derived
def custody_ok(c, m):
    return m.get('custody_phys_ok') and schema_errors(RECEIPT_ID, '/$defs/custody_v2', c['custody_receipt']) == []


@derived
def pack_route(c, m):
    return m.get('env_ok') and E(c)['payload_ref'] is not None


PACK_KEYS = ('raw_hex', 'byte_size', 'payload_id', 'media_type')


@derived
def pack_shape(c, m):
    pack = c.get('payload_pack')
    return (type(pack) is dict and set(pack) == set(PACK_KEYS) and type(pack['raw_hex']) is str
            and type(pack['payload_id']) is str)


@derived
def pack_raw(c, m):
    try:
        return bytes.fromhex(c['payload_pack']['raw_hex'])
    except ValueError:
        return None


@derived
def pack_reason(c, m):
    pack = c['payload_pack']
    return reason_of(verify_payload_bytes, m.get('pack_raw'), byte_size=pack['byte_size'],
                     payload_id=pack['payload_id'], media_type=pack['media_type'], expected_media_type=PACK_MEDIA)


@derived
def retry_phys_ok(c, m):
    return type(c['retry_event']) is dict and physical_reason(c['retry_event']) is None


@derived
def retry_ok(c, m):
    return m.get('retry_phys_ok') and schema_errors(EVENT_RECORD_ID, '', c['retry_event']) == []


@derived
def retry_digest(c, m):
    try:
        return producer_semantic_digest(c['retry_event'])
    except Refusal:
        return None


@derived
def retry_policy_reason(c, m):
    return reason_of(current_append_policy, c['retry_event'].get('replay_policy'))


@derived
def sealed_matches(c, m):
    return [r for r in c['sealed_store'] if type(r) is dict and r.get('original_ref') == c['original_ref']]


# Derived-boundary integer slots: (row suffix, path inside a checkpoint or core).
CK_SLOTS = (
    ('through', ('index_through_sequence_id',)),
    ('frontier_revision', ('index_read_token', 'frontier_revision')),
    ('selected_generation', ('index_read_token', 'source_selection', 'selected_segment_generation')),
    ('manifest_generation', ('index_read_token', 'source_selection', 'manifest_generation')),
    ('recovery_epoch', ('index_read_token', 'source_selection', 'recovery_epoch')),
    ('cursor_generation', ('source_cursor', 'segment_generation')),
    ('cursor_offset', ('source_cursor', 'byte_offset')),
    ('cursor_end', ('source_cursor', 'frame_end_offset')),
    ('cursor_last_sequence', ('source_cursor', 'last_sequence_id')),
)


def at_path(node, path):
    """(present, value) at a path of dict keys; absent when a container is not a dict or a key is missing."""
    for part in path:
        if type(node) is not dict or part not in node:
            return False, None
        node = node[part]
    return True, node


def slot_reasons(node, path):
    present, value = at_path(node, path)
    return reason_of(storage_uint64, value) if present else None


def retired_cores(c):
    retired = CK(c).get('retired_publications') if type(c.get('checkpoint')) is dict else None
    return [core for core in retired if type(core) is dict] if type(retired) is list else []


@derived
def ck_slots_ok(c, m):
    if type(c.get('checkpoint')) is not dict:
        return True
    nodes = [CK(c)] + retired_cores(c)
    return all(slot_reasons(node, path) is None for node in nodes for _s, path in CK_SLOTS)


@derived
def proj_slots_ok(c, m):
    return slot_reasons(c.get('projection'), ('sequence_id',)) is None


@derived
def proj_phys_ok(c, m):
    return m.get('proj_slots_ok') and physical_reason(c['projection']) is None


@derived
def ck_phys_ok(c, m):
    return m.get('ck_slots_ok') and physical_reason(c['checkpoint']) is None


@derived
def proj_ok(c, m):
    return m.get('proj_phys_ok') and schema_errors(CONTINUITY_ID, '/$defs/projection', c['projection']) == []


@derived
def ck_ok(c, m):
    return m.get('ck_phys_ok') and schema_errors(CONTINUITY_ID, '/$defs/checkpoint', c['checkpoint']) == []


@derived
def token_instance_ok(c, m):
    return m.get('ck_ok') and fullmatch(UUID_RE, TOK(c)['storage_instance_id'])


@derived
def selection_instance_ok(c, m):
    return m.get('ck_ok') and fullmatch(UUID_RE, SEL(c)['storage_instance_id'])


@derived
def token_generation_ok(c, m):
    return m.get('ck_ok') and fullmatch(GENERATION_ID_RE, TOK(c)['generation_id'])


@derived
def token_frontier_ok(c, m):
    return m.get('ck_ok') and fullmatch(HEX64_RE, TOK(c)['frontier_sha256'])


@derived
def cursor_dict(c, m):
    return m.get('ck_ok') and type(CUR(c)) is dict


@derived
def retired_any(c, m):
    return m.get('ck_ok') and len(RET(c)) > 0


@derived
def retained(c, m):
    return resolve_retained(c)


@derived
def frozen(c, m):
    seen = m.get('retained')['seen']
    return frozen_components(seen) if seen is not None else {}


# ---- Row specification ---------------------------------------------------------------------------------------------
# Every row: one predicate over one subject. `inputs(c, m)` returns the template's inputs (presented value and the
# independent reference it is compared with, or a shared helper's own result). It runs only when the row applies.

TEMPLATES = {
    # template: (input keys, refusal condition over `record`)
    'eq': (('presented', 'expected'),
           "type(record['presented']) is not type(record['expected']) or record['presented'] != record['expected']"),
    'ne': (('presented', 'forbidden'),
           "type(record['presented']) is type(record['forbidden']) and record['presented'] == record['forbidden']"),
    'true': (('presented',), "record['presented'] is not True"),
    'false': (('presented',), "record['presented'] is not False"),
    'none': (('presented',), "record['presented'] is not None"),
    'empty': (('presented',), "type(record['presented']) is not list or len(record['presented']) != 0"),
    'member': (('presented', 'collection'),
               "type(record['collection']) is not list or record['presented'] not in record['collection']"),
    'at_most': (('presented', 'limit'),
                "type(record['presented']) is not int or record['presented'] > record['limit']"),
    'ordered': (('start', 'end'),
                "type(record['start']) is not int or type(record['end']) is not int or record['start'] > record['end']"),
    'not_in': (('presented', 'reasons'), "record['presented'] in record['reasons']"),
    'handled': (('presented', 'handled'),
                "record['presented'] is not None and record['presented'] not in record['handled']"),
}

ROWS = []
ROW_BY_ID = {}
ENTAILED = {}   # row id -> (rows that always refuse first, written proof)
BOUNDARIES = ('append', 'retry', 'derived', 'withdrawal', 'retained')


def row(boundary, table, rid, code, field, words, kind, inputs, gates=(), families=None, when=None):
    assert rid not in ROW_BY_ID, rid
    assert kind in TEMPLATES, kind
    entry = {'boundary': boundary, 'table': table, 'id': rid, 'code': code, 'field': field, 'words': words,
             'kind': kind, 'inputs': inputs, 'gates': tuple(gates),
             'families': None if families is None else tuple(families), 'when': when,
             'line': sys._getframe(1).f_lineno}
    ROWS.append(entry)
    ROW_BY_ID[rid] = entry
    return entry


def entailed(rid, first, proof):
    ENTAILED[rid] = (tuple(first), proof)


def record_for(r, c, m):
    applies = (r['families'] is None or c['family'] in r['families']) and all(m.get(g) for g in r['gates'])
    if applies and r['when'] is not None:
        applies = r['when'](c, m) is True
    record = {'applies': applies is True}
    if record['applies']:
        values = r['inputs'](c, m)
        assert set(values) == set(TEMPLATES[r['kind']][0]), (r['id'], sorted(values))
        record.update(values)
    return record


def EQ(presented, expected):
    return {'presented': presented, 'expected': expected}


def NE(presented, forbidden):
    return {'presented': presented, 'forbidden': forbidden}


def V(presented):
    return {'presented': presented}


A = 'append'
FAM_ACTOR, FAM_PROV, FAM_RED, FAM_REPLAY = FAMILIES

# append: scenario and admission ---------------------------------------------------------------------------------
row(A, 'append_admission', 'append_event_object', 'event_schema', '/event',
    'the presented EventRecord is a JSON object', 'true', lambda c, m: V(type(E(c)) is dict))
row(A, 'append_admission', 'append_admitted', 'missing_event_registration', '/live/admitted',
    'the live registry admits this exact family/version before any effect', 'true',
    lambda c, m: V(c['live']['admitted']))
row(A, 'append_admission', 'append_family_known', 'unknown_family', '/family',
    'the family is one of the four continuity families', 'member',
    lambda c, m: {'presented': c['family'], 'collection': list(FAMILIES)})
row(A, 'append_admission', 'append_dedupe', 'dedupe_unavailable', '/dedupe_caught_up',
    'authoritative lifetime dedupe catch-up is verified', 'true', lambda c, m: V(c['dedupe_caught_up']))
row(A, 'append_admission', 'append_source_resolved', 'source_unavailable', '/source/resolved',
    'the original source observation is independently resolved', 'true', lambda c, m: V(c['source']['resolved']))
row(A, 'append_admission', 'append_source_durable', 'source_identity_join', '/source/durably_issued',
    'the original source event is durably issued', 'true', lambda c, m: V(c['source']['durably_issued']))

# append: numbers (SP-1100 / CV-1100) before any shape or packing --------------------------------------------------
row(A, 'append_numbers', 'append_sequence_uint64', 'number_domain', '/event/sequence_id',
    'sequence_id is Storage\'s exact uint64 (shared storage_uint64)', 'none',
    lambda c, m: V(reason_of(storage_uint64, E(c)['sequence_id'])), gates=('fam',),
    when=lambda c, m: 'sequence_id' in E(c))
row(A, 'append_numbers', 'append_event_physical', 'number_domain', '/event',
    'the whole event value encodes under SP-1100 EVENT_VALUE (every integer in the physical range)', 'none',
    lambda c, m: V(physical_reason(E(c))), gates=('seq_ok',))

# append: envelope -------------------------------------------------------------------------------------------------
row(A, 'append_envelope', 'append_envelope_schema', 'event_schema', '/event',
    'the full EventRecord owner schema accepts the event (shared CV-1101 date-time checker)', 'empty',
    lambda c, m: V(m.get('env_errors')), gates=('phys_ok',))
row(A, 'append_envelope', 'append_event_type', 'event_type_join', '/event/event_type',
    'event_type is this family', 'eq', lambda c, m: EQ(E(c)['event_type'], c['family']), gates=('env_ok',))
row(A, 'append_envelope', 'append_payload_schema_id', 'payload_schema_id', '/event/payload_schema_id',
    'payload_schema_id names this family\'s payload schema', 'eq',
    lambda c, m: EQ(E(c)['payload_schema_id'], PAYLOAD_SCHEMA_IDS[c['family']]), gates=('env_ok',))
row(A, 'append_envelope', 'append_observed_utc_z', 'timestamp_invalid', '/event/observed_at_utc',
    'the Storage-assigned observed_at_utc passes shared date_time with the CV-253 storage_utc_z profile', 'none',
    lambda c, m: V(reason_of(date_time, E(c)['observed_at_utc'], profile=STORAGE_UTC_Z)), gates=('env_ok',))
row(A, 'append_envelope', 'append_persisted_utc_z', 'timestamp_invalid', '/event/persisted_at_utc',
    'the Storage-assigned persisted_at_utc passes shared date_time with the CV-253 storage_utc_z profile', 'none',
    lambda c, m: V(reason_of(date_time, E(c)['persisted_at_utc'], profile=STORAGE_UTC_Z)), gates=('env_ok',))
row(A, 'append_envelope', 'append_scope_kind', 'scope_join', '/event/scope_kind',
    'this Project-bound edition requires scope_kind project', 'eq',
    lambda c, m: EQ(E(c)['scope_kind'], 'project'), gates=('env_ok',))
row(A, 'append_envelope', 'append_producer_sequence_null', 'envelope_join', '/event/producer_sequence_id',
    'producer_sequence_id is null', 'none', lambda c, m: V(E(c)['producer_sequence_id']), gates=('env_ok',))

# append: Storage-assigned metadata is Storage's own record, never the caller's -----------------------------------
for _k in ('event_id', 'sequence_id', 'observed_at_utc', 'persisted_at_utc'):
    row(A, 'append_storage', 'append_storage_' + _k.replace('_at_utc', ''), 'storage_metadata', '/event/' + _k,
        'the event ' + _k + ' equals Storage\'s own record', 'eq',
        (lambda k: lambda c, m: EQ(E(c)[k], c['storage_record'][k]))(_k), gates=('env_ok',))

# append: policy, scope, partition -----------------------------------------------------------------------------------
row(A, 'append_policy', 'append_replay_only', 'replay_only_not_appendable', '/event/replay_policy',
    'a current append refuses projector_replay_only (shared current_append_policy)', 'ne',
    lambda c, m: NE(m.get('policy_reason'), 'replay_only_not_appendable'), gates=('env_ok',))
row(A, 'append_policy', 'append_replay_policy', 'family_current_replay_policy', '/event/replay_policy',
    'all current writes select dedupe_by_idempotency_key', 'eq',
    lambda c, m: EQ(E(c)['replay_policy'], 'dedupe_by_idempotency_key'), gates=('env_ok',),
    when=lambda c, m: m.get('policy_reason') != 'replay_only_not_appendable')
row(A, 'append_policy', 'append_project_source', 'scope_join', '/event/project_id',
    'the envelope project_id is the exact original Project', 'eq',
    lambda c, m: EQ(E(c)['project_id'], c['source']['project_id']), gates=('project_scope',))
row(A, 'append_policy', 'append_partition', 'partition_join', '/scope_partition',
    'the Storage partition appended to is project~base64url_no_pad(UTF8(project_id))', 'eq',
    lambda c, m: EQ(c['scope_partition'], partition_of(E(c)['project_id'])), gates=('project_scope',))

# append: payload --------------------------------------------------------------------------------------------------
row(A, 'append_payload', 'append_payload_schema', 'payload_schema', '/event/payload',
    'the full family payload owner schema accepts the payload (closed; $defs/id pattern and not; timestamp format)',
    'empty', lambda c, m: V(m.get('pay_errors')), gates=('env_ok',))
row(A, 'append_payload', 'append_payload_project', 'scope_join', '/event/payload/project_id',
    'payload project_id is the exact original Project', 'eq',
    lambda c, m: EQ(P(c)['project_id'], c['source']['project_id']), gates=('pay_ok',))
row(A, 'append_payload', 'append_created_source', 'source_time_join', '/event/payload/created_at_utc',
    'created_at_utc is the original source event occurrence time (CV-1600..1603)', 'eq',
    lambda c, m: EQ(P(c)['created_at_utc'], c['source']['created_at_utc']), gates=('pay_ok',))
row(A, 'append_payload', 'append_source_event', 'source_identity_join', '/event/payload/source_event_id',
    'source_event_id is the independently resolved original', 'eq',
    lambda c, m: EQ(P(c)['source_event_id'], c['source']['source_event_id']), gates=('pay_ok',))
row(A, 'append_payload', 'append_source_not_self', 'source_identity_join', '/event/payload/source_event_id',
    'source_event_id is never this event', 'ne',
    lambda c, m: NE(P(c)['source_event_id'], E(c)['event_id']), gates=('pay_ok',))
row(A, 'append_payload', 'append_event_id', 'identity_join', '/event/event_id',
    'event_id is evt_continuity_ + SHA-256 of the recomputed RFC 8785 tuple', 'eq',
    lambda c, m: EQ(E(c)['event_id'], m.get('recomputed')[1]), gates=('pay_ok', 'not_self'))
row(A, 'append_payload', 'append_idempotency_key', 'idempotency_key_join', '/event/idempotency_key',
    'idempotency_key is continuity@1: + the same digest', 'eq',
    lambda c, m: EQ(E(c)['idempotency_key'], m.get('recomputed')[0]), gates=('pay_ok',))

# append: envelope copies of the payload and the authenticated source ------------------------------------------------
COPIES = (
    ('causation', 'causation_event_id', lambda c: P(c)['source_event_id']),
    ('parent', 'parent_event_id', lambda c: P(c)['source_event_id']),
    ('correlation', 'correlation_id', lambda c: P(c)['continuity_id']),
    ('occurred', 'occurred_at_utc', lambda c: P(c)['created_at_utc']),
    ('thread', 'thread_id', lambda c: c['source']['thread_id']),
    ('run', 'run_id', lambda c: c['source']['run_id']),
    ('node', 'node_id', lambda c: c['source']['node_id']),
    ('attempt', 'attempt_id', lambda c: c['source']['attempt_id']),
    ('requested_account', 'requested_account_ref', lambda c: c['source']['requested_account_ref']),
    ('effective_account', 'effective_account_ref', lambda c: c['source']['effective_account_ref']),
)
for _i, (_n, _f, _src) in enumerate(COPIES):
    row(A, 'append_copies_%d' % (1 + _i // 5), 'append_copy_' + _n, 'envelope_join', '/event/' + _f,
        'the envelope ' + _f + ' is the exact copy CV-1600 names (including required-present nulls)', 'eq',
        (lambda f, src: lambda c, m: EQ(E(c)[f], src(c)))(_f, _src), gates=('env_ok', 'pay_ok'))

# append: each family's own source fact ----------------------------------------------------------------------------
UP = lambda c: c['source']['upstream_checkpoint']  # noqa: E731
row(A, 'append_fact_1', 'append_fact_actor_ref', 'fact_join', '/event/payload/actor_ref',
    'actor_ref equals the independently resolved original source principal', 'eq',
    lambda c, m: EQ(P(c)['actor_ref'], c['source']['principal']), gates=('pay_ok',), families=(FAM_ACTOR,))
row(A, 'append_fact_1', 'append_fact_actor_kind', 'fact_join', '/event/payload/actor_kind',
    'actor_kind equals the original source principal kind', 'eq',
    lambda c, m: EQ(P(c)['actor_kind'], c['source']['principal_kind']), gates=('pay_ok',), families=(FAM_ACTOR,))
row(A, 'append_fact_1', 'append_fact_provenance_ref', 'fact_join', '/event/payload/provenance_ref',
    'provenance_ref is the exact retained output/handoff version', 'eq',
    lambda c, m: EQ(P(c)['provenance_ref'], c['source']['provenance_ref']), gates=('pay_ok',), families=(FAM_PROV,))
row(A, 'append_fact_1', 'append_fact_provenance_names_source', 'fact_join', '/source/provenance_names_source',
    'that provenance version names source_event_id (a route target is not provenance evidence)', 'true',
    lambda c, m: V(c['source']['provenance_names_source']), gates=('pay_ok',), families=(FAM_PROV,))
row(A, 'append_fact_1', 'append_fact_redaction_profile', 'fact_join', '/event/payload/redaction_profile_id',
    'redaction_profile_id equals the actual original redaction owner result', 'eq',
    lambda c, m: EQ(P(c)['redaction_profile_id'], c['source']['redaction_profile_id']), gates=('pay_ok',),
    families=(FAM_RED,))
row(A, 'append_fact_1', 'append_fact_redaction_decision', 'fact_join', '/event/payload/redaction_decision',
    'redaction_decision is the applied result, not a requested transform', 'eq',
    lambda c, m: EQ(P(c)['redaction_decision'], c['source']['redaction_decision']), gates=('pay_ok',),
    families=(FAM_RED,))
row(A, 'append_fact_2', 'append_fact_replay_ref', 'fact_join', '/event/payload/replay_checkpoint_ref',
    'replay_checkpoint_ref resolves the original source stream checkpoint', 'eq',
    lambda c, m: EQ(P(c)['replay_checkpoint_ref'], UP(c)['checkpoint_ref']), gates=('pay_ok',),
    families=(FAM_REPLAY,))
row(A, 'append_fact_2', 'append_fact_replay_upstream', 'fact_join', '/source/upstream_checkpoint/is_downstream',
    'it is an upstream checkpoint, never this event\'s downstream continuity checkpoint', 'false',
    lambda c, m: V(UP(c)['is_downstream']), gates=('pay_ok',), families=(FAM_REPLAY,))
row(A, 'append_fact_2', 'append_fact_replay_instance', 'fact_join',
    '/source/upstream_checkpoint/token_storage_instance_id',
    'its complete SP-278 durable token is from this Storage instance', 'eq',
    lambda c, m: EQ(UP(c)['token_storage_instance_id'], STORAGE_INSTANCE_ID), gates=('pay_ok',),
    families=(FAM_REPLAY,))
row(A, 'append_fact_2', 'append_fact_replay_prefix_complete', 'fact_join',
    '/source/upstream_checkpoint/prefix_complete', 'its examined prefix is complete', 'true',
    lambda c, m: V(UP(c)['prefix_complete']), gates=('pay_ok',), families=(FAM_REPLAY,))
row(A, 'append_fact_2', 'append_fact_replay_prefix_member', 'fact_join',
    '/source/upstream_checkpoint/prefix_event_ids', 'its examined prefix includes source_event_id', 'member',
    lambda c, m: {'presented': P(c)['source_event_id'], 'collection': UP(c)['prefix_event_ids']},
    gates=('pay_ok',), families=(FAM_REPLAY,))

# append: first-receipt custody (SP-286 / CV-339 v2) ---------------------------------------------------------------
for _k in RECEIPT_SLOTS:
    row(A, 'append_custody_1', 'append_receipt_slot_' + _k, 'number_domain',
        '/custody_receipt/first_append_receipt/' + _k,
        'the receipt ' + _k + ' is Storage\'s exact uint64 (shared storage_uint64)', 'none',
        (lambda k: lambda c, m: V(reason_of(storage_uint64, _receipt(c)[k])))(_k), gates=('fam',),
        when=(lambda k: lambda c, m: _receipt(c) is not None and k in _receipt(c))(_k))
row(A, 'append_custody_1', 'append_custody_physical', 'number_domain', '/custody_receipt',
    'the custody value encodes under SP-1100 EVENT_VALUE', 'none',
    lambda c, m: V(physical_reason(c.get('custody_receipt'))), gates=('custody_slots_ok',))
row(A, 'append_custody_1', 'append_custody_schema', 'receipt_schema', '/custody_receipt',
    'the full CV-339 custody_v2 owner schema accepts it (closed eleven-field AppendReceipt; acknowledged_at_utc via '
    'the shared date-time checker)', 'empty',
    lambda c, m: V(schema_errors(RECEIPT_ID, '/$defs/custody_v2', c['custody_receipt'])), gates=('custody_phys_ok',))
for _i, _k in enumerate(RECEIPT_FIELDS):
    row(A, 'append_receipt_%d' % (1 + _i // 6), 'append_receipt_' + _k, 'receipt_join',
        '/custody_receipt/first_append_receipt/' + _k,
        'the original first receipt ' + _k + ' equals Storage\'s own record', 'eq',
        (lambda k: lambda c, m: EQ(_receipt(c)[k], c['storage_record'][k]))(_k), gates=('custody_ok',))
CUSTODY = lambda c: c['custody_receipt']  # noqa: E731
row(A, 'append_custody_2', 'append_custody_group_digest', 'receipt_join', '/custody_receipt/group_digest',
    'group_digest matches the owner hex pattern in full (no trailing LF)', 'true',
    lambda c, m: V(fullmatch(RECEIPT_HEX_RE, CUSTODY(c)['group_digest'])), gates=('custody_ok',))
row(A, 'append_custody_2', 'append_custody_event_id', 'receipt_join', '/custody_receipt/event_id',
    'custody names this event', 'eq', lambda c, m: EQ(CUSTODY(c)['event_id'], E(c)['event_id']),
    gates=('custody_ok', 'env_ok'))
row(A, 'append_custody_2', 'append_custody_key', 'receipt_join', '/custody_receipt/idempotency_key',
    'custody carries this event\'s idempotency_key', 'eq',
    lambda c, m: EQ(CUSTODY(c)['idempotency_key'], E(c)['idempotency_key']), gates=('custody_ok', 'env_ok'))
row(A, 'append_custody_2', 'append_custody_event_type', 'receipt_join', '/custody_receipt/event_type',
    'custody carries this event\'s event_type', 'eq',
    lambda c, m: EQ(CUSTODY(c)['event_type'], E(c)['event_type']), gates=('custody_ok', 'env_ok'))
row(A, 'append_custody_2', 'append_custody_partition', 'receipt_join', '/custody_receipt/scope_partition',
    'custody names the partition appended to', 'eq',
    lambda c, m: EQ(CUSTODY(c)['scope_partition'], c['scope_partition']), gates=('custody_ok',))
row(A, 'append_custody_2', 'append_custody_instance', 'receipt_join', '/custody_receipt/storage_instance_id',
    'custody is in this Storage instance', 'eq',
    lambda c, m: EQ(CUSTODY(c)['storage_instance_id'], STORAGE_INSTANCE_ID), gates=('custody_ok',))
row(A, 'append_custody_3', 'append_semantic_digest', 'semantic_digest_join', '/custody_receipt/producer_semantic_digest',
    'custody commits the CV-317 producer-semantic digest recomputed from the event (applies when the projection '
    'qualifies; its only non-string slot, producer_sequence_id, is refused non-null by append_producer_sequence_null)',
    'eq',
    lambda c, m: EQ(CUSTODY(c)['producer_semantic_digest'], m.get('digest')), gates=('custody_ok', 'env_ok'),
    when=lambda c, m: m.get('digest') is not None)
row(A, 'append_custody_3', 'append_full_value', 'full_value_join',
    '/custody_receipt/original_event_value_commitment/sha256',
    'custody commits the CV-339 full-value commitment recomputed from the event', 'eq',
    lambda c, m: EQ(CUSTODY(c)['original_event_value_commitment']['sha256'], m.get('full_value')),
    gates=('custody_ok', 'env_ok'), when=lambda c, m: m.get('full_value') is not None)

# append: body, SP-337 pack and the inline limit -------------------------------------------------------------------
PACK = lambda c: c['payload_pack']  # noqa: E731
row(A, 'append_body_1', 'append_pack_shape', 'pack_join', '/payload_pack',
    'a referenced body has its four-member SP-337 descriptor (raw bytes, size, id, media type)', 'true',
    lambda c, m: V(m.get('pack_shape')), gates=('pack_route',))
row(A, 'append_body_1', 'append_pack_ref', 'pack_join', '/event/payload_ref',
    'payload_ref is blake3:<payload_id> of that descriptor', 'eq',
    lambda c, m: EQ(E(c)['payload_ref'], 'blake3:' + PACK(c)['payload_id']), gates=('pack_route', 'pack_shape'))
row(A, 'append_body_1', 'append_pack_hex', 'pack_join', '/payload_pack/raw_hex',
    'the pack bytes are present (hex decodes)', 'true', lambda c, m: V(m.get('pack_raw') is not None),
    gates=('pack_route', 'pack_shape'))
row(A, 'append_body_1', 'append_pack_size', 'pack_join', '/payload_pack/byte_size',
    'byte_size is the exact current integer length of the pack bytes (shared verify_payload_bytes)', 'not_in',
    lambda c, m: {'presented': m.get('pack_reason'), 'reasons': ['integer_type', 'integer_range', 'payload_size']},
    gates=('pack_route', 'pack_shape'), when=lambda c, m: m.get('pack_raw') is not None)
row(A, 'append_body_1', 'append_pack_id', 'pack_join', '/payload_pack/payload_id',
    'payload_id is 64 lowercase hex (shared verify_payload_bytes)', 'ne',
    lambda c, m: NE(m.get('pack_reason'), 'payload_id_type'), gates=('pack_route', 'pack_shape'),
    when=lambda c, m: m.get('pack_raw') is not None)
row(A, 'append_body_2', 'append_pack_digest', 'pack_join', '/payload_pack/payload_id',
    'payload_id is the BLAKE3 digest of the pack bytes (shared verify_payload_bytes)', 'ne',
    lambda c, m: NE(m.get('pack_reason'), 'payload_digest'), gates=('pack_route', 'pack_shape'),
    when=lambda c, m: m.get('pack_raw') is not None)
row(A, 'append_body_2', 'append_pack_media', 'pack_join', '/payload_pack/media_type',
    'the pack media type is application/json (shared verify_payload_bytes)', 'ne',
    lambda c, m: NE(m.get('pack_reason'), 'payload_media'), gates=('pack_route', 'pack_shape'),
    when=lambda c, m: m.get('pack_raw') is not None)
row(A, 'append_body_2', 'append_pack_body', 'pack_join', '/payload_pack/raw_hex',
    'the pack bytes are exactly the SP-236 encoding of the logical payload body', 'eq',
    lambda c, m: EQ(PACK(c)['raw_hex'], pack_value(P(c)).hex()), gates=('pack_route', 'pack_shape'),
    when=lambda c, m: m.get('pack_raw') is not None and m.get('pack_reason') is None)
row(A, 'append_body_2', 'append_inline_limit', 'payload_inline_limit', '/event/payload',
    'an inline body (payload_ref null) is at most 16 KiB of SP-236 bytes (SP-337)', 'at_most',
    lambda c, m: {'presented': len(pack_value(P(c))), 'limit': INLINE_LIMIT}, gates=('env_ok',),
    when=lambda c, m: E(c)['payload_ref'] is None)

# retry --------------------------------------------------------------------------------------------------------------
R = 'retry'
RE_ = lambda c: c['retry_event']  # noqa: E731
row(R, 'retry', 'retry_event_object', 'retry_event_schema', '/retry_event',
    'the retry candidate is a JSON object', 'true', lambda c, m: V(type(RE_(c)) is dict))
row(R, 'retry', 'retry_event_physical', 'number_domain', '/retry_event',
    'the retry candidate encodes under SP-1100 EVENT_VALUE', 'none',
    lambda c, m: V(physical_reason(RE_(c))), when=lambda c, m: type(RE_(c)) is dict)
row(R, 'retry', 'retry_envelope_schema', 'retry_event_schema', '/retry_event',
    'the full EventRecord owner schema accepts the retry candidate (shared CV-1101 date-time checker)', 'empty',
    lambda c, m: V(schema_errors(EVENT_RECORD_ID, '', RE_(c))), gates=('retry_phys_ok',))
row(R, 'retry', 'retry_event_id', 'retry_identity_join', '/retry_event/event_id',
    'the retry preserves the original event_id', 'eq', lambda c, m: EQ(RE_(c).get('event_id'), E(c)['event_id']),
    gates=('retry_ok',))
row(R, 'retry', 'retry_idempotency_key', 'retry_identity_join', '/retry_event/idempotency_key',
    'the retry preserves the original idempotency_key', 'eq',
    lambda c, m: EQ(RE_(c).get('idempotency_key'), E(c)['idempotency_key']), gates=('retry_ok',))
row(R, 'retry', 'retry_replay_only', 'replay_only_not_appendable', '/retry_event/replay_policy',
    'a retry never selects projector_replay_only (shared current_append_policy)', 'ne',
    lambda c, m: NE(m.get('retry_policy_reason'), 'replay_only_not_appendable'), gates=('retry_ok',))
row(R, 'retry', 'retry_replay_policy', 'family_current_replay_policy', '/retry_event/replay_policy',
    'a retry selects dedupe_by_idempotency_key, like every current write', 'eq',
    lambda c, m: EQ(RE_(c).get('replay_policy'), 'dedupe_by_idempotency_key'), gates=('retry_ok',),
    when=lambda c, m: m.get('retry_policy_reason') != 'replay_only_not_appendable')
row(R, 'retry', 'retry_semantic', 'idempotency_conflict', '/retry_event',
    'the retry\'s complete CV-317 producer-semantic digest equals the original\'s (no conflict)', 'eq',
    lambda c, m: EQ(m.get('retry_digest'), m.get('digest')), gates=('retry_ok',),
    when=lambda c, m: (RE_(c).get('event_id') == E(c)['event_id'] and
                       RE_(c).get('idempotency_key') == E(c)['idempotency_key'] and
                       m.get('retry_policy_reason') != 'replay_only_not_appendable'))
row(R, 'retry_custody', 'retry_sealed_count', 'receipt_join', '/sealed_store',
    'exactly one sealed receipt holds the original start record', 'eq',
    lambda c, m: EQ(len(m.get('sealed_matches')), 1))
row(R, 'retry_custody', 'retry_custody', 'receipt_join', '/retry_returned_receipt_hex',
    'a lost-ack retry returns the original sealed receipt', 'eq',
    lambda c, m: EQ(c['retry_returned_receipt_hex'], m.get('sealed_matches')[0]['receipt_hex']),
    when=lambda c, m: len(m.get('sealed_matches')) == 1)
row(R, 'retry_custody', 'retry_no_new_event', 'retry_transition', '/retry_sequence_unchanged',
    'an unchanged observation creates no new event', 'true', lambda c, m: V(c['retry_sequence_unchanged']))

# derived: integer slots, physical values, owner schemas -----------------------------------------------------------
D = 'derived'
row(D, 'derived_slots_1', 'derived_slot_projection_sequence', 'number_domain', '/projection/sequence_id',
    'projection sequence_id is Storage\'s exact uint64 (shared storage_uint64)', 'none',
    lambda c, m: V(slot_reasons(c['projection'], ('sequence_id',))),
    when=lambda c, m: at_path(c.get('projection'), ('sequence_id',))[0])
for _i, (_s, _p) in enumerate(CK_SLOTS):
    row(D, 'derived_slots_%d' % (1 + (_i + 1) // 5), 'derived_slot_' + _s, 'number_domain',
        '/checkpoint/' + '/'.join(_p), 'checkpoint ' + '.'.join(_p) + ' is Storage\'s exact uint64 (shared storage_uint64)',
        'none', (lambda p: lambda c, m: V(slot_reasons(c['checkpoint'], p)))(_p),
        when=(lambda p: lambda c, m: at_path(c.get('checkpoint'), p)[0])(_p))
for _i, (_s, _p) in enumerate(CK_SLOTS):
    row(D, 'retired_slots_%d' % (1 + _i // 5), 'retired_slot_' + _s, 'number_domain',
        '/checkpoint/retired_publications/*/' + '/'.join(_p),
        'every retired core\'s ' + '.'.join(_p) + ' is Storage\'s exact uint64 (shared storage_uint64)', 'eq',
        (lambda p: lambda c, m: EQ([slot_reasons(core, p) for core in retired_cores(c)],
                                   [None] * len(retired_cores(c))))(_p),
        when=lambda c, m: type(c.get('checkpoint')) is dict and len(retired_cores(c)) > 0)
row(D, 'derived_shape', 'derived_projection_physical', 'number_domain', '/projection',
    'the projection value encodes under SP-1100 EVENT_VALUE', 'none',
    lambda c, m: V(physical_reason(c['projection'])), gates=('proj_slots_ok',))
row(D, 'derived_shape', 'derived_checkpoint_physical', 'number_domain', '/checkpoint',
    'the checkpoint value encodes under SP-1100 EVENT_VALUE', 'none',
    lambda c, m: V(physical_reason(c['checkpoint'])), gates=('ck_slots_ok',))
row(D, 'derived_shape', 'projection_schema', 'projection_schema', '/projection',
    'the full projection owner schema accepts it', 'empty',
    lambda c, m: V(schema_errors(CONTINUITY_ID, '/$defs/projection', c['projection'])), gates=('proj_phys_ok',))
row(D, 'derived_shape', 'checkpoint_schema', 'checkpoint_schema', '/checkpoint',
    'the full checkpoint owner schema accepts it (every pattern/not, timestamp format, state allOf, retired cores)',
    'empty', lambda c, m: V(schema_errors(CONTINUITY_ID, '/$defs/checkpoint', c['checkpoint'])),
    gates=('ck_phys_ok',))
row(D, 'derived_shape', 'checkpoint_size', 'derived_value_limit', '/checkpoint',
    'the checkpoint value is at most 16 KiB of SP-236 bytes', 'at_most',
    lambda c, m: {'presented': len(pack_value(c['checkpoint'])), 'limit': INLINE_LIMIT}, gates=('ck_phys_ok',))
row(D, 'entailed_projection_size', 'projection_size', 'derived_value_limit', '/projection',
    'the projection value is at most 16 KiB of SP-236 bytes', 'at_most',
    lambda c, m: {'presented': len(pack_value(c['projection'])), 'limit': INLINE_LIMIT}, gates=('proj_ok',))
entailed('projection_size', ['projection_schema'],
         'Plans/continuity_event_contracts.schema.json $defs/projection is closed (additionalProperties false) with '
         'exactly ten members: two consts (39 and 5 bytes), seven $defs/id strings of at most 256 ASCII characters '
         'and an event_type enum of at most 30 characters, and one uint64. Every projection_schema accepts therefore '
         'encodes to at most 1 + 10*(1+21) + 2*(3+39) + 7*(3+256) + (2+30) + 9 = 2129 bytes of SP-236 MessagePack, '
         'below 16384; a larger projection always fails projection_schema first (this row is gated on it).')

# derived: projection joins (the original's key/body/sequence/publication) ------------------------------------------
PROJ = lambda c: c['projection']  # noqa: E731
PROJECTION_JOINS = (
    ('event_id', lambda c: E(c)['event_id']),
    ('body_event_id', lambda c: E(c)['event_id']),
    ('project_id', lambda c: P(c)['project_id']),
    ('continuity_id', lambda c: P(c)['continuity_id']),
    ('stream_id', lambda c: P(c)['stream_id']),
    ('event_type', lambda c: E(c)['event_type']),
    ('sequence_id', lambda c: E(c)['sequence_id']),
    ('publication_id', lambda c: CK(c)['publication_id']),
)
for _k, _src in PROJECTION_JOINS:
    row(D, 'projection_joins', 'projection_' + _k, 'projection_join', '/projection/' + _k,
        'projection ' + _k + ' equals the original\'s', 'eq',
        (lambda k, src: lambda c, m: EQ(PROJ(c)[k], src(c)))(_k, _src),
        gates=('proj_ok',) + (('ck_ok',) if _k == 'publication_id' else ()))

# derived: checkpoint joins and coverage -----------------------------------------------------------------------------
row(D, 'checkpoint_joins', 'checkpoint_instance', 'checkpoint_join', '/checkpoint/storage_instance_id',
    'the checkpoint is in this event\'s Storage instance', 'eq',
    lambda c, m: EQ(CK(c)['storage_instance_id'], STORAGE_INSTANCE_ID), gates=('ck_ok',))
row(D, 'checkpoint_joins', 'checkpoint_project', 'checkpoint_join', '/checkpoint/project_id',
    'the checkpoint is for this event\'s Project', 'eq', lambda c, m: EQ(CK(c)['project_id'], E(c)['project_id']),
    gates=('ck_ok',))
row(D, 'checkpoint_joins', 'checkpoint_stream', 'checkpoint_join', '/checkpoint/stream_id',
    'the checkpoint is for this event\'s stream', 'eq', lambda c, m: EQ(CK(c)['stream_id'], P(c)['stream_id']),
    gates=('ck_ok',))
row(D, 'checkpoint_joins', 'checkpoint_admits_type', 'checkpoint_join', '/checkpoint/admitted_event_types',
    'the checkpoint filter admits this event type', 'member',
    lambda c, m: {'presented': E(c)['event_type'], 'collection': CK(c)['admitted_event_types']}, gates=('ck_ok',))
row(D, 'checkpoint_joins', 'checkpoint_through', 'prefix_coverage', '/checkpoint/index_through_sequence_id',
    'the complete inclusive global prefix runs through this event', 'eq',
    lambda c, m: EQ(CK(c)['index_through_sequence_id'], E(c)['sequence_id']), gates=('ck_ok',))
row(D, 'checkpoint_joins', 'checkpoint_frontier', 'prefix_coverage', '/checkpoint/index_read_token/frontier_sha256',
    'the token frontier digest is the global prefix digest through this event', 'eq',
    lambda c, m: EQ(TOK(c)['frontier_sha256'], c['frontier_sha256']), gates=('token_frontier_ok',))
row(D, 'checkpoint_joins', 'checkpoint_cas', 'cas_conflict', '/cas_expected',
    'the prior publication matches the CAS expectation', 'eq',
    lambda c, m: EQ(c['cas_expected'], c['prior_publication_id']))
row(D, 'checkpoint_joins', 'checkpoint_atomic', 'transaction_failed', '/transaction_committed',
    'projection and checkpoint commit together', 'true', lambda c, m: V(c['transaction_committed']))

# derived: durable token, full-match restorations and joins -----------------------------------------------------------
TOKEN_FORMATS = (
    ('token_instance_uuid', ('storage_instance_id',), UUID_RE, 'format uuid (RFC 4122 string form)'),
    ('token_generation_id', ('generation_id',), GENERATION_ID_RE, 'pattern ^eig_[0-9a-f]{64}$'),
    ('token_anchor_hex', ('generation_anchor_sha256',), HEX64_RE, 'pattern ^[0-9a-f]{64}$'),
    ('token_frontier_hex', ('frontier_sha256',), HEX64_RE, 'pattern ^[0-9a-f]{64}$'),
    ('selection_instance_uuid', ('source_selection', 'storage_instance_id'), UUID_RE, 'format uuid (RFC 4122 string form)'),
) + tuple(('selection_' + f.split('.')[1].replace('_sha256', '') + '_hex', ('source_selection', f.split('.')[1]),
           HEX64_RE, 'pattern ^[0-9a-f]{64}$') for f in HEX_FIELDS if f.startswith('selection.'))
for _i, (_n, _p, _re, _w) in enumerate(TOKEN_FORMATS):
    row(D, 'token_format_%d' % (1 + _i // 6), _n, 'token_join', '/checkpoint/index_read_token/' + '/'.join(_p),
        'index_read_token.' + '.'.join(_p) + ' matches the owner ' + _w + ' in full (no trailing LF)', 'true',
        (lambda p, rx: lambda c, m: V(fullmatch(rx, at_path(TOK(c), p)[1])))(_p, _re), gates=('ck_ok',))
row(D, 'token_joins', 'token_instance', 'token_join', '/checkpoint/index_read_token/storage_instance_id',
    'the token is from this event\'s Storage instance', 'eq',
    lambda c, m: EQ(TOK(c)['storage_instance_id'], STORAGE_INSTANCE_ID), gates=('token_instance_ok',))
row(D, 'token_joins', 'selection_instance', 'token_join',
    '/checkpoint/index_read_token/source_selection/storage_instance_id',
    'the source selection is from this event\'s Storage instance', 'eq',
    lambda c, m: EQ(SEL(c)['storage_instance_id'], STORAGE_INSTANCE_ID), gates=('selection_instance_ok',))
row(D, 'token_joins', 'token_checkpoint_key', 'token_join', '/checkpoint/index_read_token/checkpoint_key',
    'checkpoint_key is event_record_index_checkpoint.v1:<storage_instance_id>', 'eq',
    lambda c, m: EQ(TOK(c)['checkpoint_key'], CHECKPOINT_KEY_PREFIX + TOK(c)['storage_instance_id']),
    gates=('token_instance_ok',))
row(D, 'token_joins', 'token_dataset_name', 'token_join', '/checkpoint/index_read_token/index_dataset_name',
    'index_dataset_name is event_record_index.v2@<generation_id>', 'eq',
    lambda c, m: EQ(TOK(c)['index_dataset_name'], DATASET_PREFIX + TOK(c)['generation_id']),
    gates=('token_generation_ok',))
row(D, 'token_joins', 'token_frontier_revision', 'token_join', '/checkpoint/index_read_token/frontier_revision',
    'the token frontier revision is the global prefix through this event', 'eq',
    lambda c, m: EQ(TOK(c)['frontier_revision'], E(c)['sequence_id']), gates=('ck_ok',))

# derived: source cursor -------------------------------------------------------------------------------------------
row(D, 'cursor', 'cursor_segment_name', 'cursor_join', '/checkpoint/source_cursor/segment_name',
    'segment_name matches the owner pattern in full (no trailing LF)', 'true',
    lambda c, m: V(fullmatch(SEGMENT_NAME_RE, CUR(c)['segment_name'])), gates=('cursor_dict',))
row(D, 'cursor', 'cursor_generation', 'cursor_join', '/checkpoint/source_cursor/segment_generation',
    'the cursor segment generation is the selected segment generation', 'eq',
    lambda c, m: EQ(CUR(c)['segment_generation'], SEL(c)['selected_segment_generation']), gates=('cursor_dict',))
row(D, 'cursor', 'cursor_last_sequence', 'cursor_join', '/checkpoint/source_cursor/last_sequence_id',
    'the cursor ends at this event\'s sequence', 'eq',
    lambda c, m: EQ(CUR(c)['last_sequence_id'], E(c)['sequence_id']), gates=('cursor_dict',))
row(D, 'cursor', 'cursor_last_event', 'cursor_join', '/checkpoint/source_cursor/last_event_id',
    'the cursor ends at this event', 'eq', lambda c, m: EQ(CUR(c)['last_event_id'], E(c)['event_id']),
    gates=('cursor_dict',))
row(D, 'cursor', 'cursor_offset_order', 'cursor_join', '/checkpoint/source_cursor/byte_offset',
    'the frame starts at or before its end offset', 'ordered',
    lambda c, m: {'start': CUR(c)['byte_offset'], 'end': CUR(c)['frame_end_offset']}, gates=('cursor_dict',))

# derived: retired publications (each core's own original token) ------------------------------------------------------
CORES = retired_cores
row(D, 'retired_joins', 'retired_state', 'retired_publication', '/checkpoint/retired_publications/*/state',
    'every retired core is withdrawn', 'eq',
    lambda c, m: EQ([core['state'] for core in CORES(c)], ['withdrawn'] * len(CORES(c))), gates=('retired_any',))
RETIRED_AUTHORITY = (('storage_instance_id', lambda c: STORAGE_INSTANCE_ID), ('project_id', lambda c: E(c)['project_id']),
                     ('stream_id', lambda c: P(c)['stream_id']))
for _k, _auth in RETIRED_AUTHORITY:
    row(D, 'retired_joins', 'retired_' + _k.replace('_id', ''), 'retired_publication',
        '/checkpoint/retired_publications/*/' + _k, 'every retired core has this event\'s ' + _k, 'eq',
        (lambda k, auth: lambda c, m: EQ([core[k] for core in CORES(c)], [auth(c)] * len(CORES(c))))(_k, _auth),
        gates=('retired_any',))
row(D, 'retired_joins', 'retired_token_instance', 'retired_publication',
    '/checkpoint/retired_publications/*/index_read_token/storage_instance_id',
    'every retired core\'s original token is from this event\'s Storage instance', 'eq',
    lambda c, m: EQ([core['index_read_token']['storage_instance_id'] for core in CORES(c)],
                    [STORAGE_INSTANCE_ID] * len(CORES(c))),
    gates=('retired_any',), when=lambda c, m: all(fullmatch(UUID_RE, core['index_read_token']['storage_instance_id'])
                                                  for core in CORES(c)))
row(D, 'retired_joins', 'retired_selection_instance', 'retired_publication',
    '/checkpoint/retired_publications/*/index_read_token/source_selection/storage_instance_id',
    'every retired core\'s source selection is from this event\'s Storage instance', 'eq',
    lambda c, m: EQ([core['index_read_token']['source_selection']['storage_instance_id'] for core in CORES(c)],
                    [STORAGE_INSTANCE_ID] * len(CORES(c))),
    gates=('retired_any',), when=lambda c, m: all(
        fullmatch(UUID_RE, core['index_read_token']['source_selection']['storage_instance_id']) for core in CORES(c)))
row(D, 'retired_joins', 'retired_checkpoint_key', 'retired_publication',
    '/checkpoint/retired_publications/*/index_read_token/checkpoint_key',
    'every retired token\'s checkpoint_key is event_record_index_checkpoint.v1:<its storage_instance_id>', 'eq',
    lambda c, m: EQ([core['index_read_token']['checkpoint_key'] for core in CORES(c)],
                    [CHECKPOINT_KEY_PREFIX + core['index_read_token']['storage_instance_id'] for core in CORES(c)]),
    gates=('retired_any',), when=lambda c, m: all(fullmatch(UUID_RE, core['index_read_token']['storage_instance_id'])
                                                  for core in CORES(c)))
row(D, 'retired_joins', 'retired_dataset_name', 'retired_publication',
    '/checkpoint/retired_publications/*/index_read_token/index_dataset_name',
    'every retired token\'s index_dataset_name is event_record_index.v2@<its generation_id>', 'eq',
    lambda c, m: EQ([core['index_read_token']['index_dataset_name'] for core in CORES(c)],
                    [DATASET_PREFIX + core['index_read_token']['generation_id'] for core in CORES(c)]),
    gates=('retired_any',), when=lambda c, m: all(fullmatch(GENERATION_ID_RE, core['index_read_token']['generation_id'])
                                                  for core in CORES(c)))
RETIRED_FORMATS = TOKEN_FORMATS + (('segment_name', None, SEGMENT_NAME_RE, 'pattern'),)
for _i, (_n, _p, _re, _w) in enumerate(RETIRED_FORMATS):
    if _p is None:
        _field, _words = 'source_cursor/segment_name', 'every retired cursor segment_name matches the owner pattern in full'
        _when = lambda c, m: any(type(core['source_cursor']) is dict for core in CORES(c))  # noqa: E731
        _inputs = lambda c, m: EQ([fullmatch(SEGMENT_NAME_RE, core['source_cursor']['segment_name'])  # noqa: E731
                                   for core in CORES(c) if type(core['source_cursor']) is dict],
                                  [True] * len([core for core in CORES(c) if type(core['source_cursor']) is dict]))
    else:
        _field = 'index_read_token/' + '/'.join(_p)
        _words = 'every retired token\'s ' + '.'.join(_p) + ' matches the owner ' + _w + ' in full (no trailing LF)'
        _when = None
        _inputs = (lambda p, rx: lambda c, m: EQ([fullmatch(rx, at_path(core['index_read_token'], p)[1])
                                                  for core in CORES(c)], [True] * len(CORES(c))))(_p, _re)
    row(D, 'retired_format_%d' % (1 + _i // 7), 'retired_' + _n, 'retired_publication',
        '/checkpoint/retired_publications/*/' + _field, _words, 'eq', _inputs, gates=('retired_any',), when=_when)

# withdrawal / rebuild (scenario model; N5 of the recheck) -----------------------------------------------------------
W = 'withdrawal'
row(W, 'withdrawal', 'withdrawal_cutoff', 'writer_cutoff', '/writer_cutoff_applied',
    'writers are cut off before withdrawal', 'true', lambda c, m: V(c['writer_cutoff_applied']))
row(W, 'withdrawal', 'withdrawal_once', 'withdrawal_once', '/withdrawal_marks',
    'the publication is withdrawn exactly once', 'eq', lambda c, m: EQ(c['withdrawal_marks'], 1))
row(W, 'withdrawal', 'withdrawal_fence', 'publication_withdrawn', '/reader_fenced',
    'readers/projectors are fenced from the withdrawn publication', 'true', lambda c, m: V(c['reader_fenced']))
row(W, 'withdrawal', 'successor_rebuild', 'successor_rebuild', '/successor_verified',
    'the successor is rebuilt and verified before the CAS switch', 'true', lambda c, m: V(c['successor_verified']))
row(W, 'withdrawal', 'replay_audit_only', 'replay_external_effect', '/replay_effects',
    'replay produces no external effect or publication', 'empty', lambda c, m: V(c['replay_effects']))
row(W, 'withdrawal', 'outcome_honest', 'outcome_mismatch', '/reported_outcome',
    'a failed/unavailable outcome is never reported as success', 'eq',
    lambda c, m: EQ(c['reported_outcome'], c['actual_outcome']))

# retained history: SP-1101 dispatch, the frozen verifier's checks, and read effects ------------------------------------
T = 'retained'
RES = lambda m: m.get('retained')['reason']  # noqa: E731
DISPATCH_ROWS = (
    ('retained_recipe_override', 'caller_recipe_override', '/retained_recipe_override',
     'a caller-supplied recipe override is refused by the shared dispatcher (resolve(recipe_override=...))'),
    ('retained_query', 'original_query', '/original_ref', 'the request names one original'),
    ('retained_receipt_present', 'original_receipt_missing', '/sealed_store',
     'a sealed receipt exists for this exact original (missing: bytes preserved, unavailable)'),
    ('retained_receipt_unique', 'original_receipt_ambiguous', '/sealed_store',
     'exactly one sealed receipt resolves the original (ambiguous: unavailable, never guessed)'),
    ('retained_receipt_wellformed', 'sealed_receipt_malformed', '/sealed_store',
     'the sealed receipt row is complete and well formed'),
    ('retained_binding', 'original_binding', '/sealed_store/*/binding',
     'the sealed receipt binds this exact original (not another original)'),
    ('retained_recipe_known', 'recipe_unknown', '/sealed_store/*/recipe',
     'the sealed recipe is in the frozen map installed outside the request'),
    ('retained_disclosure', 'current_disclosure', '/disclosure_allowed',
     'current permitted disclosure allows the read'),
)
for _rid, _reason, _field, _words in DISPATCH_ROWS:
    row(T, 'retained_dispatch', _rid, _reason, _field, _words, 'ne',
        (lambda reason: lambda c, m: NE(RES(m), reason))(_reason))
FZ = lambda m: m.get('frozen')  # noqa: E731
FROZEN_ROWS = (
    ('frozen_decodes', 'decodes', 'true', 'the sealed record, receipt and result bytes decode (SP-236)'),
    ('frozen_envelope_schema', 'envelope_schema', 'empty',
     'the original passes the frozen EventRecord schema with the shared date-time checker'),
    ('frozen_family', 'family', 'true', 'the original is one of the four continuity families'),
    ('frozen_payload_schema_id', 'payload_schema_id', 'eq', 'the original payload_schema_id is its family\'s'),
    ('frozen_recipe_family', 'recipe_family', 'eq', 'the sealed recipe is the recipe of the original\'s payload schema'),
    ('frozen_observed_utc_z', 'observed_utc_z', 'none',
     'the retained Storage observed_at_utc keeps CV-253 storage_utc_z (CV-1101)'),
    ('frozen_persisted_utc_z', 'persisted_utc_z', 'none',
     'the retained Storage persisted_at_utc keeps CV-253 storage_utc_z (CV-1101)'),
    ('frozen_payload_schema', 'payload_schema', 'empty', 'the original payload passes its frozen family schema'),
    ('frozen_identity', 'identity', 'eq', 'the original event_id is its recomputed identity'),
    ('frozen_key', 'key', 'eq', 'the original idempotency_key is its recomputed key'),
    ('frozen_source_commitment', 'source_commitment', 'eq',
     'the sealed binding commits the original\'s full value (CV-339)'),
    ('frozen_result_event_id', 'result_event_id', 'eq', 'the sealed append result names the original'),
    ('frozen_receipt_schema', 'receipt_schema', 'empty', 'the sealed custody passes the frozen custody_v2 schema'),
    ('frozen_receipt_semantic', 'receipt_semantic', 'eq',
     'the sealed custody commits the original\'s producer-semantic digest'),
    ('frozen_receipt_full_value', 'receipt_full_value', 'eq', 'the sealed custody commits the original\'s full value'),
    ('frozen_receipt_event_id', 'receipt_event_id', 'eq', 'the sealed custody names the original'),
)
for _i, (_rid, _comp, _kind, _words) in enumerate(FROZEN_ROWS):
    if _kind == 'eq':
        _inputs = (lambda comp: lambda c, m: EQ(FZ(m)[comp][0], FZ(m)[comp][1]))(_comp)
    else:
        _inputs = (lambda comp: lambda c, m: V(FZ(m)[comp]))(_comp)
    row(T, 'retained_frozen_%d' % (1 + _i // 6), _rid, 'original_verification', '/sealed_store/*/record_hex',
        _words, _kind, _inputs, when=(lambda comp: lambda c, m: comp in FZ(m))(_comp))
row(T, 'retained_effects', 'retained_no_receipt_creation', 'receipt_created_on_read', '/sealed_store',
    'reading creates no receipt: the sealed store is byte-identical before and after resolve', 'eq',
    lambda c, m: EQ(m.get('retained')['store_after'], m.get('retained')['store_before']))
row(T, 'retained_effects', 'retained_no_current_gate', 'retained_current_gate', '/event/replay_policy',
    'the shared current writer gate (current_append_policy) is never called during a retained read', 'eq',
    lambda c, m: EQ(m.get('retained')['gate_calls'], 0))
row(T, 'retained_effects', 'retained_family_withdrawn', 'historical_withdrawn', '/family_withdrawn',
    'the family is not withdrawn for readers', 'false', lambda c, m: V(c['family_withdrawn']))
row(T, 'retained_effects', 'retained_original_withdrawn', 'historical_withdrawn', '/original_withdrawn',
    'the original is not withdrawn', 'false', lambda c, m: V(c['original_withdrawn']))
row(T, 'retained_effects', 'retained_rebuild', 'historical_rebuild', '/rebuild_matches',
    'compatibility/replay-only rebuild yields the same derived state', 'true', lambda c, m: V(c['rebuild_matches']))
HANDLED_REASONS = sorted({r for _r, r, _f, _w in DISPATCH_ROWS} | {'original_verification'})
row(T, 'entailed_retained_resolved', 'retained_resolved', 'original_unavailable', '/sealed_store',
    'the dispatcher returned the original or a refusal an earlier row owns', 'handled',
    lambda c, m: {'presented': RES(m), 'handled': HANDLED_REASONS})
entailed('retained_resolved', [r for r, _x, _f, _w in DISPATCH_ROWS] + [r[0] for r in FROZEN_ROWS] +
         ['retained_no_current_gate'],
         'RetainedDispatcher.resolve (scripts/pm_event_numbers.py:523-545) refuses itself only with '
         'caller_recipe_override, original_query, original_authority, original_binding, recipe_selection, '
         'recipe_unknown, original_bytes_type, original_verification or current_disclosure; any other reason is '
         'raised by the owner or by the frozen verifier. (1) Owner: SealedReceiptOwner.authenticated_original '
         '(scripts/pm_w3i_continuity_oracles.py:693-699) raises only original_receipt_missing and '
         'original_receipt_ambiguous, then _custody_from_sealed (:665-683). That function refuses '
         'sealed_receipt_malformed at :675 unless the row has exactly SEALED_KEYS, a binding with exactly '
         'BINDING_FIELDS, a recipe with exactly RECIPE_FIELDS and three even-length lowercase-hex strings (so '
         'bytes.fromhex cannot raise). The shared constructors refuse a wrong-typed or wrong-valued member by '
         'themselves (scripts/pm_event_numbers.py:442-485): RecipeTuple.__post_init__ with recipe_tuple (:460) or '
         'recipe_resource_hash (:462), and OriginalBinding.__post_init__ with original_binding (:481) or '
         'original_scope (:484). :676-679 catches every such Refusal and re-raises it as sealed_receipt_malformed. '
         'So the owner raises only original_receipt_missing, original_receipt_ambiguous and sealed_receipt_malformed, '
         'and otherwise returns an OriginalCustody of an OriginalBinding, a RecipeTuple and three bytes values, so '
         'original_authority, recipe_selection and original_bytes_type cannot occur. AccessLoggingOwner (:706) '
         'raises exactly what its parent raises. (2) Request: retained_request (:808-818) returns an OriginalBinding '
         'or None, and None is refused by the dispatcher as original_query. (3) Frozen verifier: _frozen_verify '
         '(:774) is the conjunction of frozen_components (:717-761), which raises no Refusal. Decoding refusals are '
         'caught (:728); the date-time checks go through reason_of; producer_semantic_digest refusals are caught '
         '(:758). full_value_commitment (scripts/pm_event_numbers.py:405-412) runs only on a record that decoded '
         'canonically (so its re-encoding cannot refuse) and passed the frozen EventRecord schema (whose schema_id and '
         'schema_version consts exclude full_value_edition). identity (scripts/pm_w3i_continuity_oracles.py:212) runs qualified_jcs on schema-valid '
         'payload strings decoded from UTF-8. So the verifier returns True or False, and the dispatcher reports '
         'False as original_verification. frozen_dispatch_failures (:2657), run on every retained control and '
         'negative, requires that, once verify_original is reached, the dispatcher refuses original_verification '
         'exactly when a frozen_* row refuses. The negative-only frozen map current_gated (_current_gated_verify) '
         'may raise the current writer gate\'s own reason. It calls the instrumented gate whenever the verifier '
         'decodes a record that carries replay_policy, so retained_no_current_gate (table retained_effects, ahead of this table) refuses first. Every '
         'reason that remains has its own dispatch row (retained_dispatch). So this catch-all never refuses first.')


# ---- Tables, the checker's refusal path ----------------------------------------------------------------------------

def build_tables():
    tables, order = {}, []
    for r in ROWS:
        if r['table'] not in tables:
            tables[r['table']] = []
            order.append(r['table'])
        tables[r['table']].append(r)
    for table, rows in tables.items():
        assert len(rows) <= 8, (table, len(rows))
        assert len({r['boundary'] for r in rows}) == 1, table
        entailed_rows = [r['id'] for r in rows if r['id'] in ENTAILED]
        assert not entailed_rows or (table.startswith('entailed_') and len(rows) == 1), table
    boundary_tables = {b: [t for t in order if tables[t][0]['boundary'] == b] for b in BOUNDARIES}
    return tables, order, boundary_tables


TABLE_ROWS, TABLES, BOUNDARY_TABLES = build_tables()
ROW_TABLE = {r['id']: r['table'] for r in ROWS}
ENTAILED_TABLES = frozenset(t for t in TABLES if t.startswith('entailed_'))


@functools.lru_cache(maxsize=None)
def table_module(table):
    return importlib.import_module(TABLE_PREFIX + table)


def project_table(table, case, memo):
    return {r['id']: record_for(r, case, memo) for r in TABLE_ROWS[table]}


def evaluate(case, boundary, memo=None):
    """The complete checker for one boundary: every table predicate in table order. Returns
    ([(row, code), ...] refusals in order, {table: projected value})."""
    memo = memo or Memo(case)
    refusals, values = [], {}
    for table in BOUNDARY_TABLES[boundary]:
        module = table_module(table)
        value = project_table(table, case, memo)
        values[table] = value
        for name in module.FIELDS:
            code = getattr(module, name)(value, None)
            if code is not None:
                refusals.append((name, code))
    return refusals, values


def boundary_errors(case, boundary):
    return [code for _row, code in evaluate(case, boundary)[0]]


CONTROL_BOUNDARY = {'append': 'append', 'pack': 'append', 'pack-large': 'append', 'retry': 'retry',
                    'derived': 'derived', 'derived-retired': 'derived', 'derived-null-cursor': 'derived',
                    'withdrawal': 'withdrawal', 'retained': 'retained', 'retained-live': 'retained',
                    'compatibility': 'retained'}


def case_boundary(case_id):
    return CONTROL_BOUNDARY[case_id.split(':')[0]]


# ---- Controls (valid originals) -------------------------------------------------------------------------------------

def other_family(family):
    return FAMILIES[(FAMILIES.index(family) + 1) % len(FAMILIES)]


LINKED_SOURCE = {'thread_id': 'thread-w3i-1', 'run_id': 'run-w3i-1', 'node_id': 'node-w3i-1',
                 'attempt_id': 'attempt-w3i-1', 'requested_account_ref': 'acct-w3i-requested',
                 'effective_account_ref': 'acct-w3i-effective'}
# Each copy's witness on the linked control: the envelope carries a sibling source value instead of its own.
LINKED_SWAPS = (('thread', 'thread_id', 'node_id'), ('run', 'run_id', 'thread_id'), ('node', 'node_id', 'attempt_id'),
                ('attempt', 'attempt_id', 'node_id'), ('requested_account', 'requested_account_ref', 'effective_account_ref'),
                ('effective_account', 'effective_account_ref', 'requested_account_ref'))


def build_controls():
    controls = []
    for family in FAMILIES:
        base = build_case(family, 'control:' + family)
        controls.append(('append:' + family, copy.deepcopy(base)))
        controls.append(('pack:' + family, with_pack(copy.deepcopy(base))))
        # ATS-1280: an actual SP-337 body above 16 KiB. The EventRecord profile admits arbitrary fractional
        # precision (Contracts_V0.md CV-1101), so an owner-valid original source time makes the body exceed 16 KiB.
        large = copy.deepcopy(base)
        set_source_time(large, LONG_FRACTION_TIME)
        controls.append(('pack-large:' + family, with_pack(resync(large))))
        # Distinct non-null execution links on the source (build_source leaves them null): each copy row's witness
        # then tells the exact CV-1600 copy from a copy of a sibling field.
        linked = copy.deepcopy(base)
        linked['source'].update(LINKED_SOURCE)
        linked['event'].update(LINKED_SOURCE)
        controls.append(('append-linked:' + family, resync(linked)))
        controls.append(('retry:' + family, copy.deepcopy(base)))
        # Standing check 6: Storage-assigned metadata is outside the retry comparison.
        meta = copy.deepcopy(base)
        meta['retry_event'].update(sequence_id=77, observed_at_utc='2026-11-05T11:00:01Z',
                                   persisted_at_utc='2026-11-05T11:00:02Z')
        controls.append(('retry-storage-meta:' + family, meta))
        controls.append(('derived:' + family, copy.deepcopy(base)))
        retired = copy.deepcopy(base)
        retired['retired'] = [build_retired_core(family, '1'), build_retired_core(family, '2')]
        controls.append(('derived-retired:' + family, resync(retired)))
        controls.append(('withdrawal:' + family, copy.deepcopy(base)))
        controls.append(('retained:' + family, copy.deepcopy(base)))
        # A later live-state change: the live source observation and the live writer admission the append boundary
        # reads both change after the write. The retained original still verifies from its sealed receipt alone.
        live = copy.deepcopy(base)
        live['live']['admitted'] = False
        live['source'].update(principal='user:w3i-renamed', principal_kind='service', provenance_ref='prov:w3i-v2',
                              redaction_decision='revoked', created_at_utc='2026-11-07T00:00:00Z', run_id='run-w3i-2')
        live['source']['upstream_checkpoint'].update(checkpoint_ref='checkpoint:upstream-w3i-2',
                                                     prefix_event_ids=['evt_source_later'])
        controls.append(('retained-live:' + family, live))
        compat = copy.deepcopy(base)
        compat['event']['replay_policy'] = 'projector_replay_only'
        controls.append(('compatibility:' + family, resync(compat)))
        # Valid when written under the broad EventRecord profile: lowercase t, a nonzero offset and a long fraction
        # on the source occurrence time (CV-1101); the retained read keeps the exact original string.
        offset = copy.deepcopy(base)
        set_source_time(offset, '2026-11-05t12:00:00.123456789012+02:00')
        controls.append(('retained-offset:' + family, resync(offset)))
    return controls


CONTROL_BOUNDARY.update({'retry-storage-meta': 'retry', 'retained-offset': 'retained', 'append-linked': 'append'})


# ---- Negatives: one defect each, built from a named control ---------------------------------------------------------

FREE_ID_FIELD = {FAM_ACTOR: 'provenance_ref', FAM_PROV: 'actor_ref', FAM_RED: 'actor_ref', FAM_REPLAY: 'actor_ref'}
OTHER_UUID = '9a8b7c6d-5e4f-4a3b-8c2d-1e0f9a8b7c6d'
UUID_DEFECTS = ((lambda v: v + '}', 'trailing brace (accepted by the jsonschema uuid check)'),
                (lambda v: v[:28] + '-' + v[28:], 'extra hyphen (accepted by the jsonschema uuid check)'),
                (lambda v: v[:3] + '_' + v[4:], 'underscore digit separator (accepted by the jsonschema uuid check)'))
LONG_INT = 10 ** 4399


def _repack(sealed, field, value):
    sealed[field] = pack_value(value).hex()


def _decoded(sealed, field):
    return decode_storage_value(bytes.fromhex(sealed[field]), profile=EVENT_VALUE)


def _set_path(node, path, value):
    for part in path[:-1]:
        node = node[part]
    node[path[-1]] = value


def _get_path(node, path):
    for part in path:
        node = node[part]
    return node


def _suffix(path, suffix):
    return lambda c: _set_path(c, path, _get_path(c, path) + suffix)


def _value(path, value):
    return lambda c: _set_path(c, path, copy.deepcopy(value))


def build_negatives(controls):
    by_id = dict(controls)
    negatives = []

    def add(rid, family, control_id, mutate, mode, defect):
        bad = copy.deepcopy(by_id[control_id])
        mutate(bad)
        if mode == 'full':
            resync(bad)
        elif mode == 'no_identity':
            resync(bad, recompute_identity=False)
        else:
            assert mode == 'none', mode
        negatives.append({'row': rid, 'boundary': ROW_BY_ID[rid]['boundary'], 'family': family,
                          'control': control_id, 'defect': defect, 'case': bad})

    for family in FAMILIES:
        ac, pc, rc, dc, drc, wc, tc = ('append:' + family, 'pack:' + family, 'retry:' + family, 'derived:' + family,
                                       'derived-retired:' + family, 'withdrawal:' + family, 'retained:' + family)
        free = FREE_ID_FIELD[family]
        other = other_family(family)

        def A_(rid, mutate, mode, defect, control=ac):
            add(rid, family, control, mutate, mode, defect)

        # append: admission and scenario
        A_('append_event_object', _value(('event',), 'not-an-event'), 'none', 'EventRecord is a string')
        A_('append_event_object', _value(('event',), []), 'none', 'EventRecord is an array')
        A_('append_admitted', lambda c: c['live'].update(admitted=False), 'none', 'live registry withholds admission')
        A_('append_family_known', lambda c: c.update(family='continuity.unknown_family'), 'none', 'unknown family')
        A_('append_dedupe', lambda c: c.update(dedupe_caught_up=False), 'none', 'lifetime dedupe not caught up')
        A_('append_dedupe', lambda c: c.update(dedupe_caught_up=1), 'none', 'integer for a boolean')
        A_('append_admitted', lambda c: c['live'].update(admitted='true'), 'none', 'string boolean admission')
        A_('append_source_resolved', lambda c: c['source'].update(resolved=False), 'none', 'source unresolved')
        A_('append_source_durable', lambda c: c['source'].update(durably_issued=False), 'none', 'source not durable')
        # append: numbers. Only the event's slot changes; Storage's record keeps its own value.
        for value, label in ((1 << 64, '2**64'), (-1, '-1'), (LONG_INT, '10**4399'), (-LONG_INT, '-10**4399'),
                             ('41', 'string number'), (41.5, 'float'), (True, 'boolean'), (None, 'null'),
                             ([41], 'array'), ({'v': 41}, 'object')):
            A_('append_sequence_uint64', _value(('event', 'sequence_id'), value), 'none', 'sequence_id ' + label)
        for value, label in ((1 << 64, '2**64'), (LONG_INT, '10**4399'), (-(1 << 63) - 1, '-(2**63)-1'),
                             (-LONG_INT, '-10**4399')):
            A_('append_event_physical', _value(('event', 'payload', 'extra_member'), value), 'none',
               'payload extra member ' + label)
            A_('append_event_physical', _value(('event', 'payload', free), value), 'none',
               'payload ' + free + ' (a string slot) holds integer ' + label)
        A_('append_event_physical', _value(('event', 'migration', 'migration_id'), 1 << 64), 'none',
           'envelope migration_id holds integer 2**64')
        # append: envelope (full owner schema with the shared date-time checker)
        A_('append_envelope_schema', _value(('event', 'schema_version'), '1.0.0'), 'none', 'envelope schema_version')
        A_('append_envelope_schema', _value(('event', 'producer_sequence_id'), -1), 'full', 'producer_sequence_id -1')
        A_('append_envelope_schema', _value(('event', 'event_type'), 'Continuity.X'), 'full', 'event_type pattern')
        A_('append_envelope_schema', _value(('event', 'redaction_profile'), 'bogus'), 'full', 'redaction_profile enum')
        for value, label in (('2026-11-05T10:00:01', 'missing zone'), ('2026-11-05T10:00:01Z\n', 'trailing LF'),
                             ('2026-11-05T24:00:01Z', 'hour 24'), ('2026-11-05 10:00:01Z', 'space separator'),
                             ('2026-11-05T10:00:60Z', 'false leap second'), ('2026-11-31T10:00:01Z', 'day 31')):
            A_('append_envelope_schema', lambda c, v=value: set_storage_time(c, 'observed_at_utc', v), 'full',
               'observed_at_utc ' + label)
        A_('append_envelope_schema', lambda c: set_storage_time(c, 'persisted_at_utc', '2026-11-05T10:00:02+24:00'),
           'full', 'persisted_at_utc offset hour 24')
        A_('append_envelope_schema', _value(('event', 'occurred_at_utc'), '2026-02-30T10:00:00Z'), 'full',
           'occurred_at_utc 30 February (its copy row reads it only after the envelope schema accepts it)')
        A_('append_event_type', _value(('event', 'event_type'), other), 'full', 'event_type of another family')
        A_('append_event_type', _value(('event', 'event_type'), family + '\n'), 'full',
           'event_type with trailing LF (the anchored owner pattern accepts it)')
        A_('append_payload_schema_id', _value(('event', 'payload_schema_id'), PAYLOAD_SCHEMA_IDS[other]), 'full',
           'payload_schema_id of another family')
        for field in ('observed_at_utc', 'persisted_at_utc'):
            rid = 'append_' + field.replace('_at_utc', '') + '_utc_z'
            for value, label in (('2026-11-05T10:00:01+00:00', '+00:00'), ('2026-11-05T10:00:01-00:00', '-00:00'),
                                 ('2026-11-05T10:00:01z', 'lowercase z'), ('2026-11-05T12:00:01+02:00', 'offset')):
                A_(rid, lambda c, f=field, v=value: set_storage_time(c, f, v), 'full', field + ' ' + label)
        A_('append_scope_kind', lambda c: c['event'].update(scope_kind='application', project_id=None), 'full',
           'owner-valid application envelope (project_id null as the schema allOf requires)')
        A_('append_producer_sequence_null', _value(('event', 'producer_sequence_id'), 7), 'full',
           'producer_sequence_id 7')
        # append: Storage-assigned metadata against Storage's own record
        A_('append_storage_event_id', _value(('storage_record', 'event_id'), 'evt_continuity_' + '1' * 64),
           'no_identity', 'Storage record names another event')
        A_('append_storage_sequence_id', _value(('storage_record', 'sequence_id'), 42), 'no_identity',
           'event sequence differs from Storage\'s')
        A_('append_storage_observed', _value(('storage_record', 'observed_at_utc'), '2026-11-05T10:00:05Z'),
           'no_identity', 'event observed time differs from Storage\'s')
        A_('append_storage_persisted', _value(('storage_record', 'persisted_at_utc'), '2026-11-05T10:00:06Z'),
           'no_identity', 'event persisted time differs from Storage\'s')
        # append: policy, scope and partition
        A_('append_replay_only', _value(('event', 'replay_policy'), 'projector_replay_only'), 'full',
           'current write selects projector_replay_only')
        for policy in ('append_once', 'dedupe_by_event_id'):
            A_('append_replay_policy', _value(('event', 'replay_policy'), policy), 'full', 'replay_policy ' + policy)
        A_('append_project_source', lambda c: (c['event'].update(project_id='p-other'),
                                               c.update(scope_partition=partition_of('p-other'))), 'full',
           'envelope project is another Project (partition follows it)')
        A_('append_partition', _value(('scope_partition',), 'project~wrongpartition'), 'full', 'wrong partition')
        A_('append_partition', _value(('scope_partition',), SCOPE_PARTITION + '='), 'full', 'padded base64url')
        A_('append_partition', _value(('scope_partition',), PROJECT_ID), 'full', 'raw project id')
        # append: payload
        A_('append_payload_schema', _value(('event', 'payload', 'extra_member'), 'x'), 'full', 'unknown member')
        A_('append_payload_schema', _suffix(('event', 'payload', free), '\n'), 'full', free + ' trailing LF')
        A_('append_payload_schema', _suffix(('event', 'payload', free), '!'), 'full', free + ' outside the alphabet')
        A_('append_payload_schema', _value(('event', 'payload', free), 'x' * 257), 'full', free + ' 257 characters')
        A_('append_payload_schema', lambda c, f=free: c['event']['payload'].pop(f), 'full', free + ' missing')
        A_('append_payload_schema', _value(('event', 'payload', free), None), 'full', free + ' null')
        A_('append_payload_schema', _value(('event', 'payload', 'schema_version'), '1.0.1'), 'full', 'schema_version')
        A_('append_payload_schema', _value(('event', 'payload', 'created_at_utc'), '2026-11-05T10:00:00'), 'full',
           'created_at_utc missing zone (its copy and source rows read it only after the payload schema accepts it)')
        A_('append_payload_schema', _value(('event', 'payload', 'created_at_utc'), '2026-11-05T10:00:00Z\n'), 'full',
           'created_at_utc trailing LF')
        A_('append_payload_project', _value(('event', 'payload', 'project_id'), 'p-other'), 'full',
           'payload names another Project')
        A_('append_created_source', lambda c: (c['event']['payload'].update(created_at_utc='2026-11-05T09:00:00Z'),
                                               c['event'].update(occurred_at_utc='2026-11-05T09:00:00Z')), 'full',
           'payload time is not the source occurrence time (occurred copy follows it)')
        A_('append_created_source', _value(('source', 'created_at_utc'), '2026-11-04T10:00:00Z'), 'none',
           'the resolved source occurred at another time')
        A_('append_source_event', _value(('source', 'source_event_id'), 'evt_source_other'), 'none',
           'the resolved original is another event')
        A_('append_source_not_self', lambda c: (c['event'].update(event_id=c['event']['payload']['source_event_id']),
                                                c['storage_record'].update(event_id=c['event']['payload']['source_event_id'])),
           'no_identity', 'event_id is the source event (Storage stored it under that id)')
        A_('append_event_id', lambda c: (c['event'].update(event_id='evt_continuity_' + '0' * 64),
                                         c['storage_record'].update(event_id='evt_continuity_' + '0' * 64)),
           'no_identity', 'supplied event_id digest')
        A_('append_idempotency_key', _value(('event', 'idempotency_key'), 'continuity@1:' + '0' * 64), 'no_identity',
           'supplied idempotency_key digest')
        # append: envelope copies
        COPY_DEFECTS = {'causation': 'evt_other', 'parent': 'evt_other', 'correlation': 'cont-other',
                        'occurred': '2026-11-05T09:59:59Z', 'thread': 'thread-x', 'run': 'run-other',
                        'node': 'node-x', 'attempt': 'attempt-x', 'requested_account': 'acct-x',
                        'effective_account': 'acct-x'}
        for name, field, _src in COPIES:
            A_('append_copy_' + name, _value(('event', field), COPY_DEFECTS[name]), 'full', field + ' not copied')
        A_('append_copy_run', _value(('event', 'run_id'), None), 'full', 'run_id nulled (source has one)')
        for name, field, sibling in LINKED_SWAPS:
            A_('append_copy_' + name, (lambda f, sib: lambda c: c['event'].update({f: c['source'][sib]}))(field, sibling),
               'full', field + ' carries the source ' + sibling + ' (linked source, all links distinct and non-null)',
               control='append-linked:' + family)
        # append: the family's own source fact
        if family == FAM_ACTOR:
            A_('append_fact_actor_ref', _value(('event', 'payload', 'actor_ref'), 'user:other'), 'full', 'actor_ref')
            A_('append_fact_actor_kind', _value(('event', 'payload', 'actor_kind'), 'service'), 'full', 'actor_kind')
        elif family == FAM_PROV:
            A_('append_fact_provenance_ref', _value(('event', 'payload', 'provenance_ref'), 'prov:other'), 'full',
               'provenance_ref')
            A_('append_fact_provenance_names_source', _value(('source', 'provenance_names_source'), False), 'none',
               'provenance version does not name the source (route target)')
        elif family == FAM_RED:
            A_('append_fact_redaction_profile', _value(('event', 'payload', 'redaction_profile_id'), 'rp:other'),
               'full', 'redaction_profile_id')
            A_('append_fact_redaction_decision', _value(('event', 'payload', 'redaction_decision'), 'requested'),
               'full', 'requested, not applied')
        else:
            up = ('source', 'upstream_checkpoint')
            A_('append_fact_replay_ref', _value(('event', 'payload', 'replay_checkpoint_ref'), 'checkpoint:other'),
               'full', 'replay_checkpoint_ref')
            A_('append_fact_replay_upstream', _value(up + ('is_downstream',), True), 'none', 'downstream checkpoint')
            A_('append_fact_replay_instance', _value(up + ('token_storage_instance_id',), OTHER_UUID), 'none',
               'token from another Storage instance')
            A_('append_fact_replay_prefix_complete', _value(up + ('prefix_complete',), False), 'none',
               'incomplete prefix')
            A_('append_fact_replay_prefix_member', _value(up + ('prefix_event_ids',), ['evt_source_other']), 'none',
               'prefix does not include the source')
        # append: custody
        receipt = ('custody_receipt', 'first_append_receipt')
        for slot in RECEIPT_SLOTS:
            A_('append_receipt_slot_' + slot, _value(receipt + (slot,), 1 << 64), 'none', 'receipt ' + slot + ' 2**64')
        A_('append_receipt_slot_sequence_id', _value(receipt + ('sequence_id',), -1), 'none', 'receipt sequence -1')
        A_('append_receipt_slot_byte_offset', _value(receipt + ('byte_offset',), '0'), 'none', 'receipt offset string')
        A_('append_custody_physical', _value(('custody_receipt', 'extra_member'), LONG_INT), 'none',
           'custody extra member 10**4399')
        A_('append_custody_physical', _value(('custody_receipt', 'group_digest'), 1 << 64), 'none',
           'custody group_digest holds integer 2**64')
        A_('append_custody_schema', _value(('custody_receipt', 'redaction_profile'), 'redacted'), 'none',
           'custody redaction_profile const')
        A_('append_custody_schema', _value(('custody_receipt', 'extra_member'), 'x'), 'none', 'custody unknown member')
        for value, label in (('garbage', 'not a time'), ('2026-11-05T25:00:03Z', 'hour 25'),
                             ('2026-11-05T10:00:03Z\n', 'trailing LF'), ('2026-11-05T10:00:03', 'missing zone')):
            A_('append_custody_schema', lambda c, v=value: (c['storage_record'].update(acknowledged_at_utc=v),
                                                            c['custody_receipt']['first_append_receipt'].update(
                                                                acknowledged_at_utc=v)),
               'none', 'acknowledged_at_utc ' + label + ' (Storage\'s record and the receipt agree)')
        A_('append_custody_schema', lambda c: (c['storage_record'].update(durability_state='pending'),
                                               c['custody_receipt']['first_append_receipt'].update(
                                                   durability_state='pending')),
           'none', 'durability_state not synced')
        RECEIPT_DEFECTS = {'event_id': 'evt_other', 'sequence_id': 99, 'segment_generation': 2,
                           'segment_name': 'seg-other', 'byte_offset': 7, 'commit_group_id': 'group-other',
                           'durability_class': 'ordinary', 'durable_end_offset': 999, 'manifest_generation': 12,
                           'acknowledged_at_utc': '2026-11-05T10:00:04Z'}
        for field in RECEIPT_FIELDS:
            if field == 'durability_state':
                A_('append_receipt_durability_state', _value(('storage_record', 'durability_state'), 'pending'),
                   'none', 'the receipt says synced; Storage\'s record says pending')
            else:
                A_('append_receipt_' + field, _value(receipt + (field,), RECEIPT_DEFECTS[field]), 'none',
                   'receipt ' + field + ' differs from Storage\'s record')
        A_('append_custody_group_digest', _suffix(('custody_receipt', 'group_digest'), '\n'), 'none',
           'group_digest trailing LF (the anchored owner pattern accepts it)')
        A_('append_custody_event_id', _value(('custody_receipt', 'event_id'), 'evt_other'), 'none', 'custody event')
        A_('append_custody_key', _value(('custody_receipt', 'idempotency_key'), 'continuity@1:' + '2' * 64), 'none',
           'custody key')
        A_('append_custody_event_type', _value(('custody_receipt', 'event_type'), other), 'none', 'custody family')
        A_('append_custody_partition', _value(('custody_receipt', 'scope_partition'), 'project~other'), 'none',
           'custody partition')
        A_('append_custody_instance', _value(('custody_receipt', 'storage_instance_id'), OTHER_UUID), 'none',
           'custody in another Storage instance')
        A_('append_semantic_digest', _value(('custody_receipt', 'producer_semantic_digest'), '0' * 64), 'none',
           'supplied producer-semantic digest')
        A_('append_full_value', _value(('custody_receipt', 'original_event_value_commitment', 'sha256'), '0' * 64),
           'none', 'supplied full-value commitment')
        # append: SP-337 body (from the externalized control)
        A_('append_pack_shape', lambda c: c['payload_pack'].pop('media_type'), 'none', 'descriptor without media type',
           control=pc)
        A_('append_pack_shape', _value(('payload_pack',), None), 'none', 'no descriptor for a referenced body',
           control=pc)
        A_('append_pack_shape', _value(('payload_pack', 'raw_hex'), 5), 'none', 'pack bytes as an integer',
           control=pc)
        A_('append_pack_shape', _value(('payload_pack', 'payload_id'), 7), 'none', 'payload_id as an integer',
           control=pc)
        A_('append_pack_ref', _value(('event', 'payload_ref'), 'blake3:' + '1' * 64), 'full',
           'payload_ref names another pack', control=pc)
        A_('append_pack_ref', lambda c: c['event'].update(payload_ref=c['payload_pack']['payload_id']), 'full',
           'payload_ref without the blake3: scheme', control=pc)
        A_('append_pack_hex', _value(('payload_pack', 'raw_hex'), 'zz'), 'none', 'pack bytes unreadable', control=pc)
        A_('append_pack_size', lambda c: c['payload_pack'].update(byte_size=c['payload_pack']['byte_size'] + 1), 'none',
           'byte_size off by one', control=pc)
        A_('append_pack_size', lambda c: c['payload_pack'].update(byte_size=str(c['payload_pack']['byte_size'])),
           'none', 'byte_size as a string', control=pc)

        def _repoint(c, payload_id):
            c['payload_pack']['payload_id'] = payload_id
            c['event']['payload_ref'] = 'blake3:' + payload_id
        A_('append_pack_id', lambda c: _repoint(c, c['payload_pack']['payload_id'].upper()), 'full',
           'uppercase payload_id (payload_ref follows)', control=pc)
        A_('append_pack_digest', lambda c: _repoint(c, '0' * 64), 'full',
           'payload_id is not the BLAKE3 of the bytes (payload_ref follows)', control=pc)
        A_('append_pack_media', _value(('payload_pack', 'media_type'), 'text/plain'), 'none', 'media type',
           control=pc)

        def _other_body(c):
            body = copy.deepcopy(c['event']['payload'])
            body['continuity_id'] = 'cont-other'
            raw = pack_value(body)
            c['payload_pack'].update(raw_hex=raw.hex(), byte_size=len(raw))
            _repoint(c, blake3.blake3(raw).digest().hex())
        A_('append_pack_body', _other_body, 'full', 'pack holds another body (its id, size and ref agree)',
           control=pc)
        A_('append_inline_limit', lambda c: set_source_time(c, LONG_FRACTION_TIME), 'full',
           'owner-valid 20,000-digit source time, inline (its payload and occurred copies follow the source)')

        # retry
        RT = ('retry_event',)
        for value, label in ((1 << 64, '2**64'), (LONG_INT, '10**4399')):
            add('retry_event_physical', family, rc, _value(RT + ('payload', 'extra_member'), value), 'none',
                'retry payload extra member ' + label)
            add('retry_event_physical', family, rc, _value(RT + ('payload', free), value), 'none',
                'retry payload ' + free + ' integer ' + label)
        add('retry_event_physical', family, rc, _value(RT + ('sequence_id',), LONG_INT), 'none',
            'retry sequence_id 10**4399')
        add('retry_event_object', family, rc, _value(RT, 'not-an-event'), 'none', 'retry candidate is a string')
        add('retry_event_object', family, rc, _value(RT, None), 'none', 'retry candidate is null')
        add('retry_envelope_schema', family, rc, _value(RT + ('extra_member',), 'x'), 'none',
            'retry candidate unknown member')
        add('retry_envelope_schema', family, rc, _value(RT + ('observed_at_utc',), 'garbage'), 'none',
            'retry candidate Storage time malformed (outside the semantic comparison, still an EventRecord field)')
        add('retry_envelope_schema', family, rc, _value(RT + ('schema_version',), '1.0.0'), 'none',
            'retry candidate envelope version')
        add('retry_event_id', family, rc, _value(RT + ('event_id',), 'evt_continuity_' + '1' * 64), 'none',
            'retry event_id')
        add('retry_idempotency_key', family, rc, _value(RT + ('idempotency_key',), 'continuity@1:' + '1' * 64), 'none',
            'retry key')
        add('retry_replay_only', family, rc, _value(RT + ('replay_policy',), 'projector_replay_only'), 'none',
            'retry selects projector_replay_only')
        add('retry_replay_policy', family, rc, _value(RT + ('replay_policy',), 'append_once'), 'none',
            'retry selects append_once')
        SEMANTIC_DEFECTS = {
            'event_type': other, 'scope_kind': 'application', 'project_id': 'p-other', 'thread_id': 'thread-x',
            'run_id': 'run-other', 'node_id': 'node-x', 'attempt_id': 'attempt-x', 'actor_ref': 'user:other-observer',
            'requested_account_ref': 'acct-x', 'effective_account_ref': 'acct-x',
            'occurred_at_utc': '2026-11-05T09:59:59Z', 'producer_sequence_id': 5, 'correlation_id': 'cont-other',
            'causation_event_id': 'evt_other', 'parent_event_id': 'evt_other',
            'payload_schema_id': PAYLOAD_SCHEMA_IDS[other], 'payload_ref': 'blake3:' + '3' * 64,
            'redaction_profile': 'redacted',
        }
        for field in pm_event_numbers.PRODUCER_FIELDS:
            if field == 'idempotency_key':
                continue
            if field == 'payload':
                for pfield, pvalue in (('actor_ref', 'user:other'), ('created_at_utc', '2026-11-05T09:00:00Z'),
                                       ('redaction_decision', 'requested')):
                    add('retry_semantic', family, rc, _value(RT + ('payload', pfield), pvalue), 'none',
                        'same key, changed payload ' + pfield)
            elif field == 'migration':
                add('retry_semantic', family, rc, _value(RT + ('migration', 'migration_id'), 'migration-x'), 'none',
                    'same key, changed migration')
            elif field == 'scope_kind':
                add('retry_semantic', family, rc, lambda c: c['retry_event'].update(scope_kind='application',
                                                                                  project_id=None), 'none',
                    'same key, changed scope_kind (an owner-valid application envelope, project_id null)')
            else:
                add('retry_semantic', family, rc, _value(RT + (field,), SEMANTIC_DEFECTS[field]), 'none',
                    'same key, changed ' + field)
        add('retry_sealed_count', family, rc, _value(('sealed_store',), []), 'none', 'original start record missing')
        add('retry_sealed_count', family, rc, lambda c: c['sealed_store'].append(copy.deepcopy(c['sealed_store'][0])),
            'none', 'original start record ambiguous')
        add('retry_custody', family, rc, _value(('retry_returned_receipt_hex',), '00' * 32), 'none',
            'retry returns another receipt')
        add('retry_no_new_event', family, rc, _value(('retry_sequence_unchanged',), False), 'none',
            'unchanged observation appended a new event')
        add('retry_no_new_event', family, rc, _value(('retry_sequence_unchanged',), 'true'), 'none',
            'string boolean')

        # derived: slots (only the slot changes; nothing re-derives from it)
        for value, label in ((1 << 64, '2**64'), (-1, '-1'), (3.0, 'float'), ('41', 'string number')):
            add('derived_slot_projection_sequence', family, dc, _value(('projection', 'sequence_id'), value), 'none',
                'projection sequence_id ' + label)
        for slot, path in CK_SLOTS:
            add('derived_slot_' + slot, family, dc, _value(('checkpoint',) + path, 1 << 64), 'none',
                'checkpoint ' + '.'.join(path) + ' 2**64')
            add('retired_slot_' + slot, family, drc, _value(('checkpoint', 'retired_publications', 0) + path, 1 << 64),
                'none', 'retired core ' + '.'.join(path) + ' 2**64')
        add('derived_slot_recovery_epoch', family, dc,
            _value(('checkpoint', 'index_read_token', 'source_selection', 'recovery_epoch'), 3.0), 'none',
            'recovery_epoch float')
        add('derived_slot_through', family, dc, _value(('checkpoint', 'index_through_sequence_id'), LONG_INT), 'none',
            'index_through_sequence_id 10**4399')
        add('retired_slot_frontier_revision', family, drc,
            _value(('checkpoint', 'retired_publications', 0, 'index_read_token', 'frontier_revision'), -1), 'none',
            'retired frontier_revision -1')
        add('derived_projection_physical', family, dc, _value(('projection', 'extra_member'), LONG_INT), 'none',
            'projection extra member 10**4399')
        add('derived_checkpoint_physical', family, dc, _value(('checkpoint', 'extra_member'), 1 << 64), 'none',
            'checkpoint extra member 2**64')
        add('projection_schema', family, dc, _value(('projection', 'extra_member'), 'x'), 'none', 'unknown member')
        add('projection_schema', family, dc, _suffix(('projection', 'project_id'), '!'), 'none', 'project_id !')
        add('projection_schema', family, dc, _suffix(('projection', 'event_id'), '\n'), 'none', 'event_id LF')
        add('checkpoint_size', family, dc, _value(('checkpoint', 'index_read_token', 'checkpoint_ref'), 'r' * 20000),
            'none', 'checkpoint over 16 KiB (owner-valid opaque checkpoint_ref)')
        # derived: checkpoint owner schema, current fields (finding 3)
        CS = ('checkpoint',)
        for field in ('project_id', 'stream_id', 'storage_instance_id', 'publication_id'):
            for suffix, label in (('!', 'outside the alphabet'), ('\n', 'trailing LF')):
                add('checkpoint_schema', family, dc, _suffix(CS + (field,), suffix), 'none', field + ' ' + label)
        for path, value, label in (
                (('extra_member',), 'x', 'unknown member'), (('hold_refs',), ['hold!'], 'hold ref alphabet'),
                (('hold_refs',), ['h', 'h'], 'duplicate hold refs'), (('state',), 'other', 'state enum'),
                (('withdrawn_at_utc',), WITHDRAW_TIME, 'current state with a withdrawal time (allOf)'),
                (('filter_complete',), False, 'filter incomplete'), (('admitted_event_types',), [], 'no types'),
                (('index_read_token', 'generation_id'), 'eig_' + 'g' * 64, 'generation_id pattern'),
                (('index_read_token', 'frontier_sha256'), 'F' * 64, 'frontier pattern'),
                (('index_read_token', 'source_selection', 'current_ref'), 'storage/other', 'current_ref const'),
                (('source_cursor', 'segment_name'), 'not-a-segment', 'segment_name pattern'),
                (('source_cursor', 'last_event_id'), '', 'empty last_event_id')):
            add('checkpoint_schema', family, dc, _value(CS + path, value), 'none', label)
        add('checkpoint_schema', family, dc, lambda c: c['checkpoint'].update(state='withdrawn', withdrawn_at_utc=None),
            'none', 'withdrawn state without its time (allOf)')
        add('checkpoint_schema', family, dc, lambda c: c['checkpoint'].update(state='withdrawn',
                                                                            withdrawn_at_utc='not-a-time\n'),
            'none', 'withdrawn state with a malformed time (shared date-time checker)')
        add('checkpoint_schema', family, dc, lambda c: c['checkpoint'].update(state='withdrawn',
                                                                            withdrawn_at_utc='2026-11-06T09:00:00'),
            'none', 'withdrawal time missing zone')
        # derived: every field of a retired publication (finding 3)
        RC = ('checkpoint', 'retired_publications', 0)
        RT_ = RC + ('index_read_token',)
        RS = RT_ + ('source_selection',)
        retired_cases = [
            ('checkpoint_schema', RC + ('schema_id',), 'x'), ('checkpoint_schema', RC + ('schema_version',), 'x'),
            ('checkpoint_schema', RC + ('projector_id',), 'x'), ('checkpoint_schema', RC + ('projector_version',), 'x'),
            ('checkpoint_schema', RC + ('admitted_event_types',), ['continuity.other']),
            ('checkpoint_schema', RC + ('admitted_event_types',), []),
            ('retired_storage_instance', RC + ('storage_instance_id',), 'other-instance'),
            ('retired_project', RC + ('project_id',), 'p-other'), ('retired_stream', RC + ('stream_id',), 's-other'),
            ('retired_checkpoint_key', RT_ + ('checkpoint_key',), 'x'),
            ('checkpoint_schema', RT_ + ('checkpoint_key',), ''), ('checkpoint_schema', RT_ + ('checkpoint_ref',), ''),
            ('retired_dataset_name', RT_ + ('index_dataset_name',), 'x'),
            ('checkpoint_schema', RT_ + ('index_dataset_name',), ''),
            ('checkpoint_schema', RS + ('current_ref',), 'x'), ('checkpoint_schema', RS + ('manifest_ref',), 'x'),
            ('checkpoint_schema', RC + ('source_cursor', 'last_event_id'), ''),
            ('checkpoint_schema', RC + ('filter_complete',), False), ('checkpoint_schema', RC + ('state',), 'other'),
            ('checkpoint_schema', RC + ('withdrawn_at_utc',), 'not-a-time'),
            ('checkpoint_schema', RC + ('withdrawn_at_utc',), WITHDRAW_TIME + '\n'),
            ('checkpoint_schema', RC + ('withdrawn_at_utc',), '2026-11-06T09:00:00'),
            ('checkpoint_schema', RC + ('withdrawn_at_utc',), None),
            ('checkpoint_schema', RC + ('hold_refs',), ['hold!']), ('checkpoint_schema', RC + ('hold_refs',), ['h', 'h']),
            ('checkpoint_schema', RC + ('extra_member',), 'x'),
        ]
        for field in ('storage_instance_id', 'project_id', 'stream_id', 'publication_id'):
            retired_cases += [('checkpoint_schema', RC + (field,), '!'), ('checkpoint_schema', RC + (field,), '\n')]
        for name, path, _rx, _w in RETIRED_FORMATS:
            full = (RC + ('source_cursor', 'segment_name')) if path is None else (RT_ + path)
            if _rx is UUID_RE:
                retired_cases += [('checkpoint_schema', full, '\n'), ('checkpoint_schema', full, '!')]
                for mutate, label in UUID_DEFECTS:
                    add('retired_' + name, family, drc,
                        (lambda p, f: lambda c: _set_path(c, p, f(_get_path(c, p))))(full, mutate), 'none',
                        'retired ' + '.'.join(path) + ' ' + label)
            else:
                retired_cases += [('retired_' + name, full, '\n'), ('checkpoint_schema', full, '!')]
        for rid, path, value in retired_cases:
            if value in ('\n', '!'):
                add(rid, family, drc, _suffix(path, value), 'none', 'retired ' + '.'.join(map(str, path[3:])) +
                    (' trailing LF' if value == '\n' else ' outside the alphabet'))
            else:
                add(rid, family, drc, _value(path, value), 'none', 'retired ' + '.'.join(map(str, path[3:])) + ' ' +
                    repr(value)[:40])
        add('retired_state', family, drc, lambda c: c['checkpoint']['retired_publications'][0].update(
            state='current', withdrawn_at_utc=None), 'none', 'a retired core still current')
        add('retired_token_instance', family, drc, lambda c: c['checkpoint']['retired_publications'][0][
            'index_read_token'].update(storage_instance_id=OTHER_UUID, checkpoint_key=CHECKPOINT_KEY_PREFIX + OTHER_UUID),
            'none', 'retired token from another Storage instance (its key follows)')
        add('retired_selection_instance', family, drc, _value(RS + ('storage_instance_id',), OTHER_UUID), 'none',
            'retired selection from another Storage instance')
        add('checkpoint_schema', family, drc, lambda c: c['checkpoint']['retired_publications'].append(
            copy.deepcopy(c['checkpoint']['retired_publications'][0])), 'none', 'three retired cores (maxItems 2)')
        # derived: projection joins
        PROJ_DEFECTS = {'event_id': 'evt_other', 'body_event_id': 'evt_other', 'project_id': 'p-other',
                        'continuity_id': 'cont-other', 'stream_id': 's-other', 'event_type': other, 'sequence_id': 40,
                        'publication_id': 'pub-other'}
        for field, _src in PROJECTION_JOINS:
            add('projection_' + field, family, dc, _value(('projection', field), PROJ_DEFECTS[field]), 'none',
                'projection ' + field)
        # derived: checkpoint joins, token, cursor
        TK = ('checkpoint', 'index_read_token')
        for rid, path, value, label in (
                ('checkpoint_instance', ('checkpoint', 'storage_instance_id'), 'other-instance', 'Storage instance'),
                ('checkpoint_project', ('checkpoint', 'project_id'), 'p-other', 'Project'),
                ('checkpoint_stream', ('checkpoint', 'stream_id'), 's-other', 'stream'),
                ('checkpoint_admits_type', ('checkpoint', 'admitted_event_types'), [other], 'filter'),
                ('checkpoint_through', ('checkpoint', 'index_through_sequence_id'), 40, 'through sequence'),
                ('checkpoint_frontier', TK + ('frontier_sha256',), '0' * 64, 'frontier digest'),
                ('checkpoint_cas', ('cas_expected',), 'pub-other', 'CAS expectation'),
                ('checkpoint_atomic', ('transaction_committed',), False, 'not atomic'),
                ('checkpoint_atomic', ('transaction_committed',), 'true', 'string boolean'),
                ('token_selection_placeholder', None, None, None)):
            if rid == 'token_selection_placeholder':
                continue
            add(rid, family, dc, _value(path, value), 'none', label)
        for name, path, rx, _w in TOKEN_FORMATS:
            if rx is UUID_RE:
                for mutate, label in UUID_DEFECTS:
                    add(name, family, dc, (lambda p, f: lambda c: _set_path(c, p, f(_get_path(c, p))))(TK + path, mutate),
                        'none', '.'.join(path) + ' ' + label)
                for suffix in ('\n', '!'):
                    add('checkpoint_schema', family, dc, _suffix(TK + path, suffix), 'none',
                        '.'.join(path) + (' trailing LF' if suffix == '\n' else ' !') + ' (jsonschema uuid check)')
            else:
                add(name, family, dc, _suffix(TK + path, '\n'), 'none', '.'.join(path) + ' trailing LF')
        add('token_instance', family, dc, lambda c: c['checkpoint']['index_read_token'].update(
            storage_instance_id=OTHER_UUID, checkpoint_key=CHECKPOINT_KEY_PREFIX + OTHER_UUID), 'none',
            'token from another Storage instance (its key follows)')
        add('selection_instance', family, dc, _value(TK + ('source_selection', 'storage_instance_id'), OTHER_UUID),
            'none', 'selection from another Storage instance')
        add('token_checkpoint_key', family, dc, _value(TK + ('checkpoint_key',), 'x'), 'none', 'checkpoint_key')
        add('token_dataset_name', family, dc, _value(TK + ('index_dataset_name',), 'x'), 'none', 'dataset name')
        add('token_frontier_revision', family, dc, _value(TK + ('frontier_revision',), 40), 'none',
            'frontier revision')
        CU = ('checkpoint', 'source_cursor')
        add('cursor_segment_name', family, dc, _suffix(CU + ('segment_name',), '\n'), 'none', 'segment_name LF')
        add('cursor_generation', family, dc, _value(CU + ('segment_generation',), 2), 'none', 'cursor generation')
        add('cursor_last_sequence', family, dc, _value(CU + ('last_sequence_id',), 40), 'none', 'cursor sequence')
        add('cursor_last_event', family, dc, _value(CU + ('last_event_id',), 'evt_other'), 'none', 'cursor event')
        add('cursor_offset_order', family, dc, _value(CU + ('byte_offset',), 2000), 'none', 'offset after end')

        # withdrawal
        for rid, field, value in (('withdrawal_cutoff', 'writer_cutoff_applied', False),
                                  ('withdrawal_once', 'withdrawal_marks', 2),
                                  ('withdrawal_once', 'withdrawal_marks', 0),
                                  ('withdrawal_once', 'withdrawal_marks', True),
                                  ('withdrawal_once', 'withdrawal_marks', '1'),
                                  ('withdrawal_cutoff', 'writer_cutoff_applied', 'true'),
                                  ('withdrawal_fence', 'reader_fenced', 1),
                                  ('withdrawal_fence', 'reader_fenced', False),
                                  ('successor_rebuild', 'successor_verified', False),
                                  ('replay_audit_only', 'replay_effects', ['scheduler_wake']),
                                  ('outcome_honest', 'actual_outcome', 'failed')):
            add(rid, family, wc, _value((field,), value), 'none', field + ' ' + repr(value))

        # retained
        def T_(rid, mutate, mode, defect):
            add(rid, family, tc, mutate, mode, defect)
        T_('retained_recipe_override', _value(('retained_recipe_override',), 'caller-selected-recipe'), 'none',
           'caller recipe override (through resolve(recipe_override=...))')
        T_('retained_query', _value(('original_ref',), ''), 'none', 'empty original reference')
        T_('retained_query', _value(('event',), 'not-an-event'), 'none', 'the request names no original')
        T_('retained_query', _value(('event', 'schema_version'), '1.0.0'), 'none',
           'the request names another envelope edition (the shared full-value commitment refuses it)')
        T_('retained_receipt_present', _value(('sealed_store',), []), 'none', 'missing receipt')
        T_('retained_receipt_present',
           lambda c, fam=other: c.update(sealed_store=[copy.deepcopy(build_case(fam, 'other-original')['sealed_store'][0])]),
           'none', 'missing receipt: the store holds only another original\'s receipt, under that original\'s own ref')
        T_('retained_receipt_unique', lambda c: c['sealed_store'].append(copy.deepcopy(c['sealed_store'][0])), 'none',
           'ambiguous receipt')
        T_('retained_receipt_wellformed', _value(('sealed_store', 0, 'record_hex'), 'zz'), 'none',
           'sealed row bytes not hex')
        T_('retained_receipt_wellformed', lambda c: c['sealed_store'][0].pop('result_hex'), 'none',
           'sealed row without its result')
        # The shared constructors' own refusals (scripts/pm_event_numbers.py:442-485) are the sealed row's defects.
        for part, key, value, reason in (('recipe', 'identity_recipe', 7, 'recipe_tuple'),
                                         ('recipe', 'physical_profile', None, 'recipe_tuple'),
                                         ('recipe', 'resource_manifest_sha256', 'zz', 'recipe_resource_hash'),
                                         ('binding', 'project_id', 7, 'original_scope'),
                                         ('binding', 'server_id', 7, 'original_binding')):
            T_('retained_receipt_wellformed', _value(('sealed_store', 0, part, key), value), 'none',
               'sealed %s.%s = %r (the shared constructor refuses %s)' % (part, key, value, reason))

        def _wrong_original(c, fam=other):
            wrong = copy.deepcopy(build_case(fam, 'other-original')['sealed_store'][0])
            wrong['original_ref'] = c['original_ref']
            c['sealed_store'] = [wrong]
        T_('retained_binding', _wrong_original, 'none', 'receipt for another original under this reference')
        T_('retained_recipe_known', _value(('sealed_store', 0, 'recipe', 'identity_recipe'), 'unknown-recipe'),
           'none', 'sealed recipe not installed')
        T_('retained_disclosure', _value(('disclosure_allowed',), False), 'none', 'disclosure refused')
        T_('frozen_decodes', lambda c: c['sealed_store'][0].update(record_hex='00' + c['sealed_store'][0]['record_hex'][2:]),
           'none', 'sealed record bytes corrupt')
        T_('frozen_envelope_schema', _value(('event', 'redaction_profile'), 'bogus'), 'full',
           'original fails the frozen EventRecord schema')
        T_('frozen_family', _value(('event', 'event_type'), 'continuity.other_family'), 'full',
           'original of an unknown family')

        def _psid(c):
            c['event']['payload_schema_id'] = PAYLOAD_SCHEMA_IDS[other]
            resync(c)
            c['sealed_store'][0]['recipe'] = {f: getattr(recipe_tuple(other), f) for f in RECIPE_FIELDS}
        T_('frozen_payload_schema_id', _psid, 'none', 'original names another family\'s payload schema '
           '(sealed with that recipe)')
        T_('frozen_recipe_family', _value(('sealed_store', 0, 'recipe'),
                                          {f: getattr(recipe_tuple(other), f) for f in RECIPE_FIELDS}), 'none',
           'sealed recipe of another family')
        T_('frozen_observed_utc_z', lambda c: set_storage_time(c, 'observed_at_utc', '2026-11-05T10:00:01+00:00'),
           'full', 'retained observed_at_utc +00:00')
        T_('frozen_persisted_utc_z', lambda c: set_storage_time(c, 'persisted_at_utc', '2026-11-05T10:00:02z'),
           'full', 'retained persisted_at_utc lowercase z')
        T_('frozen_payload_schema', _value(('event', 'payload', 'extra_member'), 'x'), 'full',
           'original payload fails its frozen schema')
        T_('frozen_identity', lambda c: (c['event'].update(event_id='evt_continuity_' + '0' * 64),
                                         c['storage_record'].update(event_id='evt_continuity_' + '0' * 64)),
           'no_identity', 'original sealed under a forged event_id (consistent everywhere)')
        T_('frozen_key', _value(('event', 'idempotency_key'), 'continuity@1:' + '0' * 64), 'no_identity',
           'original sealed under a forged key')

        def _record_variant(c):
            variant = copy.deepcopy(c['event'])
            variant['observed_at_utc'] = '2026-11-05T10:00:09Z'
            sealed = c['sealed_store'][0]
            _repack(sealed, 'record_hex', variant)
            _repack(sealed, 'result_hex', append_result(variant))
            _repack(sealed, 'receipt_hex', build_custody_receipt(variant, c['storage_record'], c['scope_partition']))
        T_('frozen_source_commitment', _record_variant, 'none',
           'sealed bytes are another record than the one the binding commits')
        T_('frozen_result_event_id', lambda c: _repack(c['sealed_store'][0], 'result_hex',
                                                       dict(append_result(c['event']), event_id='evt_other')),
           'none', 'sealed result names another event')

        def _receipt_edit(**changes):
            def edit(c):
                sealed = c['sealed_store'][0]
                receipt_value = _decoded(sealed, 'receipt_hex')
                for path, value in changes.items():
                    _set_path(receipt_value, tuple(path.split('.')), value)
                _repack(sealed, 'receipt_hex', receipt_value)
            return edit
        T_('frozen_receipt_schema', _receipt_edit(extra_member='x'), 'none', 'sealed custody unknown member')
        T_('frozen_receipt_semantic', _receipt_edit(producer_semantic_digest='0' * 64), 'none',
           'sealed custody producer digest')
        T_('frozen_receipt_full_value', _receipt_edit(**{'original_event_value_commitment.sha256': '0' * 64}), 'none',
           'sealed custody full-value commitment')
        T_('frozen_receipt_event_id', _receipt_edit(event_id='evt_other'), 'none', 'sealed custody event')
        T_('retained_no_receipt_creation', _value(('owner_impl',), 'access_logging'), 'none',
           'owner writes an access receipt while reading (seen only by the store snapshot)')
        T_('retained_no_current_gate', _value(('frozen_map',), 'current_gated'), 'none',
           'frozen verifier runs the current writer gate (seen only by the instrumented gate)')
        T_('retained_family_withdrawn', _value(('family_withdrawn',), True), 'none', 'family withdrawn')
        T_('retained_original_withdrawn', _value(('original_withdrawn',), True), 'none', 'original withdrawn')
        T_('retained_rebuild', _value(('rebuild_matches',), False), 'none', 'rebuild differs')
    return negatives


# ---- Timestamp fields, derived from the owner schemas (CV-1101) -------------------------------------------------------

def _date_time_paths(root, node, path, out, seen):
    """Every `format: date-time` location reachable from node through properties, items, $ref, anyOf/oneOf/allOf and
    if/then/else, as an instance path (* for array items)."""
    if not isinstance(node, dict):
        return
    if node.get('format') == 'date-time':
        out.add(path)
    if '$ref' in node:
        assert node['$ref'].startswith('#/'), node['$ref']
        target = root
        for part in node['$ref'][2:].split('/'):
            target = target[part]
        if (id(target), path) not in seen:
            seen.add((id(target), path))
            _date_time_paths(root, target, path, out, seen)
    for name, sub in node.get('properties', {}).items():
        _date_time_paths(root, sub, path + '/' + name, out, seen)
    for key in ('anyOf', 'oneOf', 'allOf'):
        for sub in node.get(key, []):
            _date_time_paths(root, sub, path, out, seen)
    for key in ('then', 'else'):
        if key in node:
            _date_time_paths(root, node[key], path, out, seen)
    if isinstance(node.get('items'), dict):
        _date_time_paths(root, node['items'], path + '/*', out, seen)


# subject -> {instance path: (owner profile, the shared checks and the rows that enforce it)}
TIMESTAMP_FIELDS = {
    'event': {
        '/occurred_at_utc': ('event_record', 'append_envelope_schema (format) / frozen_envelope_schema; copy of '
                                             'created_at_utc at append_copy_occurred'),
        '/observed_at_utc': ('event_record + storage_utc_z', 'append_envelope_schema (format) + append_observed_utc_z '
                                                             '(date_time storage_utc_z) / frozen_observed_utc_z; '
                                                             'Storage record join append_storage_observed'),
        '/persisted_at_utc': ('event_record + storage_utc_z', 'append_envelope_schema (format) + '
                                                              'append_persisted_utc_z / frozen_persisted_utc_z; '
                                                              'Storage record join append_storage_persisted'),
    },
    'payload': {
        '/created_at_utc': ('event_record', 'append_payload_schema (format) / frozen_payload_schema; source join '
                                            'append_created_source'),
    },
    'checkpoint': {
        '/withdrawn_at_utc': ('event_record', 'checkpoint_schema (format and the state allOf)'),
        '/retired_publications/*/withdrawn_at_utc': ('event_record', 'checkpoint_schema (format and the core state '
                                                                     'allOf)'),
    },
    'projection': {},
    'custody': {
        '/first_append_receipt/acknowledged_at_utc': ('event_record', 'append_custody_schema (format) / '
                                                                      'frozen_receipt_schema; Storage record join '
                                                                      'append_receipt_acknowledged_at_utc'),
    },
}
TIMESTAMP_SUBJECTS = {
    'event': (EVENT_RECORD_SCHEMA, EVENT_RECORD_SCHEMA),
    'payload': (CONTINUITY_SCHEMA, CONTINUITY_SCHEMA['$defs']['actor_identified']),
    'checkpoint': (CONTINUITY_SCHEMA, CONTINUITY_SCHEMA['$defs']['checkpoint']),
    'projection': (CONTINUITY_SCHEMA, CONTINUITY_SCHEMA['$defs']['projection']),
    'custody': (RECEIPT_SCHEMA, RECEIPT_SCHEMA['$defs']['custody_v2']),
}


def timestamp_inventory():
    """Re-derive the date-time fields from the owner schemas and compare with TIMESTAMP_FIELDS; any difference fails."""
    derived_paths, problems = {}, []
    for subject, (root, node) in TIMESTAMP_SUBJECTS.items():
        out = set()
        _date_time_paths(root, node, '', out, set())
        derived_paths[subject] = sorted(out)
        if set(out) != set(TIMESTAMP_FIELDS[subject]):
            problems.append({'subject': subject, 'schema': sorted(out), 'declared': sorted(TIMESTAMP_FIELDS[subject])})
    for family in FAMILIES:
        out = set()
        _date_time_paths(CONTINUITY_SCHEMA, CONTINUITY_SCHEMA['$defs'][PAYLOAD_DEFS[family]], '', out, set())
        if out != set(TIMESTAMP_FIELDS['payload']):
            problems.append({'subject': family, 'schema': sorted(out)})
    return derived_paths, problems


# ---- Running the complete checker -----------------------------------------------------------------------------------

FROZEN_ROW_IDS = frozenset(r[0] for r in FROZEN_ROWS)
VERIFIER_REACHED = (None, 'original_verification', 'current_disclosure')


def frozen_dispatch_failures(boundary, refusals, memo, where):
    """The installed frozen verifier, as the shared RetainedDispatcher ran it, must agree with the frozen rows: once
    the dispatcher reaches verify_original (scripts/pm_event_numbers.py:541; its reason is then None,
    original_verification or the later current_disclosure), it refuses original_verification exactly when a frozen_*
    row refuses. The rows read their own recomputation (frozen), so this observes the verifier the dispatcher
    actually called."""
    if boundary != 'retained':
        return []
    frozen_refused = any(rid in FROZEN_ROW_IDS for rid, _code in refusals)
    dispatcher = memo.get('retained')['reason']
    if dispatcher not in VERIFIER_REACHED:
        return []
    if frozen_refused != (dispatcher == 'original_verification'):
        return [dict(where, frozen_dispatch={'dispatcher_reason': dispatcher, 'frozen_row_refused': frozen_refused})]
    return []


def check_controls_and_negatives(controls, negatives):
    failures, refused_rows = [], {}
    for cid, case in controls:
        memo = Memo(case)
        refusals, _ = evaluate(case, case_boundary(cid), memo)
        if refusals:
            failures.append({'control': cid, 'refusals': refusals})
        failures += frozen_dispatch_failures(case_boundary(cid), refusals, memo, {'control': cid})
    for n in negatives:
        memo = Memo(n['case'])
        refusals, _ = evaluate(n['case'], n['boundary'], memo)
        failures += frozen_dispatch_failures(n['boundary'], refusals, memo,
                                             {'negative': n['row'], 'family': n['family'], 'defect': n['defect']})
        want = [(n['row'], ROW_BY_ID[n['row']]['code'])]
        for rid, _code in refusals:
            refused_rows[rid] = refused_rows.get(rid, 0) + 1
        if refusals != want:
            failures.append({'negative': n['row'], 'family': n['family'], 'defect': n['defect'],
                             'want': want, 'refusals': refusals})
    return failures, refused_rows


# ---- Shared number corpus through the complete checker ------------------------------------------------------------

def corpus_number_values():
    corpus = json.loads((ROOT / 'Plans/event_number_recipe_corpus.json').read_text())
    raws, ints = [], []
    for case in corpus['cases']:
        if case.get('date_time_profile'):
            continue
        op = case.get('op')
        if op in ('token', 'parse', 'parse_token', 'slot') and type(case.get('raw')) is str:
            raws.append(case['raw'])
        if op == 'json_number' and type(case.get('token')) is str:
            raws.append(case['token'])
        if op in ('integer', 'uint64') and type(case.get('value')) is dict and '@int' in case['value']:
            ints.append(case['value']['@int'])
    long = '1' + '0' * 4399
    raws += [long, '-' + long]
    ints += [long, str(UINT64_MAX), str(1 << 64)]
    return list(dict.fromkeys(raws)), list(dict.fromkeys(ints))


def _expected_sequence_accept(token):
    try:
        value = loads_current_json(token)
    except Refusal:
        return False
    return reason_of(storage_uint64, value) is None


def _load_case_sequence(base, token):
    case = copy.deepcopy(base)
    case['event']['sequence_id'] = '__W3I_SEQUENCE__'
    case['storage_record']['sequence_id'] = '__W3I_SEQUENCE__'
    text = json.dumps(case).replace('"__W3I_SEQUENCE__"', token)
    return loads_current_json(text)


def corpus_number_checks(controls):
    """Every shared number spelling enters through the checker's own raw ingress (loads_current_json) at the Storage
    sequence slot, as Storage assigned it, and runs the complete append route. The expectation is composed from the
    shared helpers alone; any disagreement fails the run."""
    raws, ints = corpus_number_values()
    totals = {'accepted': 0, 'refused': 0, 'load_refused': 0}
    disagreements = []
    for cid, base in controls:
        if not cid.startswith('append:'):
            continue
        for token in raws + ints:
            expected = _expected_sequence_accept(token)
            try:
                loaded = _load_case_sequence(base, token)
            except Refusal:
                if expected:
                    disagreements.append((cid, token[:40], 'load_refused'))
                totals['load_refused'] += 1
                continue
            resync(loaded)
            actual = evaluate(loaded, 'append')[0] == []
            if actual != expected:
                disagreements.append((cid, token[:40], actual))
            totals['accepted' if actual else 'refused'] += 1
    return totals, len(raws), len(ints), disagreements


def main():
    eager = {'continuity': eager_refs(CONTINUITY_SCHEMA), 'event_record': eager_refs(EVENT_RECORD_SCHEMA),
             'receipt': eager_refs(RECEIPT_SCHEMA)}
    controls = build_controls()
    negatives = build_negatives(controls)
    failures, refused_rows = check_controls_and_negatives(controls, negatives)
    witnessed = {n['row'] for n in negatives}
    rows = [r['id'] for r in ROWS]
    unwitnessed = sorted(set(rows) - witnessed)
    if sorted(ENTAILED) != unwitnessed:
        failures.append({'witness_inventory': 'rows without a witness must be exactly the entailed rows',
                         'unwitnessed': unwitnessed, 'entailed': sorted(ENTAILED)})
    for rid in ENTAILED:
        if refused_rows.get(rid):
            failures.append({'entailed_row_refused': rid})
    timestamp_paths, timestamp_problems = timestamp_inventory()
    if timestamp_problems:
        failures.append({'timestamp_inventory': timestamp_problems})
    corpus_totals, raws, ints, disagreements = corpus_number_checks(controls)
    if disagreements:
        failures.append({'number_corpus_disagreements': disagreements[:20]})
    summary = {
        'status': 'pass' if not failures else 'fail',
        'families': list(FAMILIES),
        'eager_refs': eager,
        'rows': len(rows),
        'tables': len(TABLES),
        'rows_with_witness': len(witnessed),
        'entailed_rows': sorted(ENTAILED),
        'controls': len(controls),
        'negatives': len(negatives),
        'negatives_by_boundary': {b: sum(1 for n in negatives if n['boundary'] == b) for b in BOUNDARIES},
        'timestamp_fields': {subject: {path: TIMESTAMP_FIELDS[subject][path][0] for path in paths}
                             for subject, paths in timestamp_paths.items()},
        'number_corpus': corpus_totals,
        'number_corpus_disagreements': len(disagreements),
        'raw_spellings': raws,
        'exact_integers': ints,
        'failures': failures[:60],
    }
    print(json.dumps(summary, indent=2, default=str))
    return 0 if not failures else 1


def _exportable(value):
    if type(value) is int and not -(1 << 200) < value < (1 << 200):
        return {'@w3i_long_int': 'power_of_ten_4399' if abs(value) == LONG_INT else 'out_of_range',
                'negative': value < 0}
    if type(value) is dict:
        return {k: _exportable(v) for k, v in value.items()}
    if type(value) is list:
        return [_exportable(v) for v in value]
    return value


def export_fixtures(path):
    """Write the named controls and single-defect negatives as a fixture data artifact (instance data; no schema
    declarations). Integers beyond Python's text conversion limit are written as tagged placeholders."""
    controls = build_controls()
    negatives = build_negatives(controls)
    items = [{'kind': 'control', 'case_id': cid, 'family': case['family'], 'boundary': case_boundary(cid),
              'value': _exportable(case)} for cid, case in controls]
    items += [{'kind': 'negative', 'case_id': '%s:%s:%d' % (n['row'], n['family'], i), 'family': n['family'],
               'boundary': n['boundary'], 'target_row': n['row'], 'expected_code': ROW_BY_ID[n['row']]['code'],
               'control': n['control'], 'defect': n['defect'], 'value': _exportable(n['case'])}
              for i, n in enumerate(negatives)]
    doc = {'schema_id': 'pm.w3i.continuity_contract_fixtures.v2', 'fixture_only': True, 'families': list(FAMILIES),
           'items': items}
    Path(path).write_text(json.dumps(doc, indent=1, sort_keys=True) + '\n')
    return len(items)


if __name__ == '__main__':
    sys.exit(main())
