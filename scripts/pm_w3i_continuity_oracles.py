#!/usr/bin/env python3
"""W3I wave-3 phase 2: the complete continuity lane checker.

Four NEWLY AUTHORED families (CV-1600..1603, SP-1600..1603, OSI-1600..1603,
ATS-1280..1283), prepared without admission. Every refusal is a named guard row
(scripts/pm_w3i_continuity_guards.py); the shared guard tool proves isolation.

Shared rules adopted (gated NUMRULE head 58c2816ff3):
- CV-1100: loads_current_json at raw ingress; current_integer / storage_uint64
  at every schema integer slot; qualified_jcs for the identity preimage;
  producer_semantic_bytes/_digest for the CV-317 projection.
- SP-1100: storage_value_bytes / decode_storage_value (EVENT_VALUE) for derived
  value sizes and full_value_commitment (CV-339).
- SP-1101: retained originals resolve through RetainedDispatcher over the
  independently sealed receipt for that exact original; the recipe tuple comes
  only from the sealed receipt, never from the request; no receipt is created
  while reading; current_append_policy never runs on a retained original.
- CV-1101: pm_event_datetime.date_time at every timestamp field with its owner
  profile (event_record for source/event times, storage_utc_z for
  Storage-assigned observed/persisted times).

No lane-local number cap, serializer or timestamp parser. No admission, no
registry append, no native execution. Deterministic: no clock, network,
randomness or machine-dependent input.

Schema decomposition for guard attribution: the shape validator used by the
schema rows disables pattern/format/not (and the checkpoint state allOf); each
disabled invariant is enforced by its own named row with a single-defect
witness (id tokens, timestamps, token grammar, cursor grammar, state join).
The owner schema files are unchanged; no rule is weakened.
"""
import base64
import blake3
import copy
import hashlib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))

from jsonschema import Draft202012Validator  # noqa: E402
from referencing import Registry, Resource  # noqa: E402
from referencing.jsonschema import DRAFT202012  # noqa: E402

from pm_event_numbers import (  # noqa: E402
    EVENT_VALUE, Refusal, JsonNumber,
    current_integer, current_integer_token, storage_uint64, exact_boolean,
    current_append_policy, loads_current_json, qualified_jcs,
    producer_semantic_bytes, producer_semantic_digest,
    storage_value_bytes, decode_storage_value, full_value_commitment,
    verify_payload_bytes,
    RecipeTuple, OriginalBinding, OriginalCustody, FrozenRecipe, RetainedDispatcher,
)
from pm_event_datetime import date_time, EVENT_RECORD, STORAGE_UTC_Z  # noqa: E402

FAMILIES = (
    'continuity.actor_identified',
    'continuity.provenance_recorded',
    'continuity.redaction_applied',
    'continuity.replay_checkpointed',
)
PAYLOAD_SCHEMA_IDS = {
    'continuity.actor_identified': 'pm.continuity.actor_identified.payload.v1',
    'continuity.provenance_recorded': 'pm.continuity.provenance_recorded.payload.v1',
    'continuity.redaction_applied': 'pm.continuity.redaction_applied.payload.v1',
    'continuity.replay_checkpointed': 'pm.continuity.replay_checkpointed.payload.v1',
}
PAYLOAD_DEFS = {
    'continuity.actor_identified': 'actor_identified',
    'continuity.provenance_recorded': 'provenance_recorded',
    'continuity.redaction_applied': 'redaction_applied',
    'continuity.replay_checkpointed': 'replay_checkpointed',
}
PRODUCERS = {
    'continuity.actor_identified': 'orchestrator.continuity_actor_identified.v1@1.0.0',
    'continuity.provenance_recorded': 'orchestrator.continuity_provenance_recorded.v1@1.0.0',
    'continuity.redaction_applied': 'orchestrator.continuity_redaction_applied.v1@1.0.0',
    'continuity.replay_checkpointed': 'orchestrator.continuity_replay_checkpointed.v1@1.0.0',
}
APPEND_PRODUCER = 'storage.continuity_append.v1@1.0.0'
PROJECTOR_ID = 'storage.continuity_projector.v1'
PROJECTOR_VERSION = '1.0.0'
READER_ID = 'reader.orchestrator.continuity_audit.v1@1.0.0'
INDEX_READER = 'reader.storage.event_record_index@1.0.0'

PROJECT_ID = 'p-w3i'
STREAM_ID = 's-w3i-main'
SCOPE_PARTITION = 'project~' + base64.urlsafe_b64encode(PROJECT_ID.encode('utf-8')).decode('ascii').rstrip('=')
STORAGE_INSTANCE_ID = '3f2a9c1e-7b4d-4e8a-9c1f-5d6e7a8b9c0d'
SERVER_ID = 'server-w3i'
SOURCE_TIME = '2026-11-05T10:00:00Z'
OBSERVED_TIME = '2026-11-05T10:00:01.123456789Z'
PERSISTED_TIME = '2026-11-05T10:00:02Z'
ACK_TIME = '2026-11-05T10:00:03Z'
WITHDRAW_TIME = '2026-11-06T09:00:00Z'
INLINE_LIMIT = 16384
UINT64_MAX = (1 << 64) - 1

# Exact full-match grammars (SW-F1): anchored patterns alone accept a trailing
# LF under Python's validator, so every identifier rule is a fullmatch here.
ID_TOKEN = re.compile(r'[A-Za-z0-9_.:@/+\-]{1,256}', re.ASCII)
HEX64 = re.compile(r'[0-9a-f]{64}', re.ASCII)
UUID_TOKEN = re.compile(r'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}', re.ASCII)
GENERATION_ID = re.compile(r'eig_[0-9a-f]{64}', re.ASCII)
SEGMENT_NAME = re.compile(r'seg-[0-9]{6,}-[0-9]{20}(-[0-9]{20}\.seglog|\.active)', re.ASCII)
EVENT_TYPE_TOKEN = re.compile(r'[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+', re.ASCII)

PAYLOAD_ID_FIELDS = (
    'project_id', 'continuity_id', 'stream_id', 'fact_ref', 'actor_ref', 'actor_kind',
    'source_event_id', 'provenance_ref', 'redaction_profile_id', 'redaction_decision',
)
RETIRED_LIMIT = 2


def _load_schema(name):
    return json.loads((ROOT / 'Plans' / name).read_text())


CONTINUITY_SCHEMA = _load_schema('continuity_event_contracts.schema.json')
EVENT_RECORD_SCHEMA = _load_schema('event_record.schema.json')


def _shape_view(schema):
    """Shape-only copy: pattern/format/not and the checkpoint state allOf are
    enforced by their own named rows, so each refusal has one attributable row.
    """
    def strip(node):
        if isinstance(node, dict):
            return {k: strip(v) for k, v in node.items()
                    if k not in ('pattern', 'format', 'not')}
        if isinstance(node, list):
            return [strip(v) for v in node]
        return node
    view = strip(schema)
    for name in ('checkpoint', 'checkpoint_core'):
        if name in view.get('$defs', {}):
            view['$defs'][name].pop('allOf', None)
    return view


CONTINUITY_SHAPE = _shape_view(CONTINUITY_SCHEMA)
EVENT_RECORD_SHAPE = _shape_view(EVENT_RECORD_SCHEMA)

EVENT_RECORD_ID = 'https://puppetmaster.local/schemas/event_record/2.0.0/schema.json'
CONTINUITY_ID = CONTINUITY_SCHEMA['$id']
REGISTRY = Registry().with_resources([
    (CONTINUITY_ID, Resource.from_contents(CONTINUITY_SCHEMA, default_specification=DRAFT202012)),
    (EVENT_RECORD_ID, Resource.from_contents(EVENT_RECORD_SCHEMA, default_specification=DRAFT202012)),
])
SHAPE_REGISTRY = Registry().with_resources([
    (CONTINUITY_ID, Resource.from_contents(CONTINUITY_SHAPE, default_specification=DRAFT202012)),
    (EVENT_RECORD_ID, Resource.from_contents(EVENT_RECORD_SHAPE, default_specification=DRAFT202012)),
])
SHAPE_VALIDATOR = Draft202012Validator  # pattern/format/not absent from the shape views


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


def schema_errors(root_id, pointer, value):
    """Shape validation rooted at the registered resource so every internal
    $ref resolves against the full definition set. The named rows own the
    pattern/format/state invariants removed from the shape view. A value whose
    integer is too large for Python's error-message string conversion is refused
    with a code, never raised (no process-global digit-limit change)."""
    ref = root_id + (('#' + pointer) if pointer else '')
    validator = SHAPE_VALIDATOR({'$ref': ref}, registry=SHAPE_REGISTRY)
    try:
        return [e.message for e in validator.iter_errors(value)]
    except ValueError:
        return ['integer exceeds the validatable digit limit']


def identity_preimage(event_type, payload):
    return [event_type, payload['project_id'], payload['continuity_id'],
            payload['source_event_id'], payload['fact_ref']]


def identity(event_type, payload):
    """CV-1600..1603: RFC 8785 of the ordered string tuple, SHA-256, exact prefixes."""
    digest = hashlib.sha256(qualified_jcs(identity_preimage(event_type, payload))).hexdigest()
    return 'continuity@1:' + digest, 'evt_continuity_' + digest


def timestamp_ok(value, profile):
    try:
        return date_time(value, profile=profile) == value
    except Refusal:
        return False


def id_token_ok(value):
    return type(value) is str and ID_TOKEN.fullmatch(value) is not None


def hex64_ok(value):
    return type(value) is str and HEX64.fullmatch(value) is not None


def uint64_ok(value):
    try:
        storage_uint64(value)
        return True
    except Refusal:
        return False


def pack_value(value):
    return storage_value_bytes(value, profile=EVENT_VALUE)


def b64u(data):
    return base64.urlsafe_b64encode(data).decode('ascii').rstrip('=')

# ---- Deterministic builders --------------------------------------------------------------------------------------

def _hex(label):
    return hashlib.sha256(label.encode('utf-8')).hexdigest()


def _structural_digest(value):
    return hashlib.sha256(json.dumps(value, sort_keys=True, ensure_ascii=True,
                                     separators=(",", ":")).encode()).hexdigest()


# The resource manifest is a structural fingerprint of the schema graph, not a
# producer JCS preimage: schema bounds carry uint64 values beyond binary64.
RESOURCE_MANIFEST_SHA256 = _structural_digest(
    {"continuity": CONTINUITY_SCHEMA, "event_record": EVENT_RECORD_SCHEMA})


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


def build_source(family):
    """The independently resolved original owner observation (OSI-1600..1603)."""
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


def build_storage_record(event):
    """Storage's own assigned record; receipt fields are verified against it."""
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


def build_first_receipt(record):
    return {k: record[k] for k in (
        'event_id', 'sequence_id', 'segment_generation', 'segment_name', 'byte_offset',
        'commit_group_id', 'durability_class', 'durable_end_offset', 'durability_state',
        'manifest_generation', 'acknowledged_at_utc')}


def build_custody_receipt(event, record):
    first = build_first_receipt(record)
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
        'scope_partition': SCOPE_PARTITION,
        'event_type': event['event_type'],
        'idempotency_key': event['idempotency_key'],
        'producer_semantic_digest': producer_semantic_digest(event),
        'group_digest': _hex('w3i-group:' + event['event_id']),
        'first_append_receipt': first,
        'redaction_profile': event['redaction_profile'],
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


def build_sealed_receipt(event, record, result):
    """The independently sealed receipt for one exact original. Reading never creates one."""
    binding = original_binding(event)
    recipe = recipe_tuple(event['event_type'])
    custody = build_custody_receipt(event, record)
    return {
        'original_ref': 'original:' + event['event_id'],
        'binding': {f: getattr(binding, f) for f in (
            'storage_instance_id', 'scope_kind', 'server_id', 'project_id', 'event_type',
            'event_id', 'idempotency_key', 'owner_operation_id', 'source_commitment')},
        'recipe': {f: getattr(recipe, f) for f in (
            'envelope_schema_id', 'envelope_schema_version', 'payload_schema_id', 'payload_schema_version',
            'owner_source_id', 'owner_edition', 'registry_revision', 'identity_recipe', 'producer_recipe',
            'physical_profile', 'full_value_profile', 'local_source_profile', 'payload_profile',
            'resource_manifest_sha256')},
        'record_hex': pack_value(event).hex(),
        'result_hex': pack_value(result).hex(),
        'receipt_hex': pack_value(custody).hex(),
    }


def build_read_token(sequence_id, frontier_sha256):
    generation_id = 'eig_' + _hex('w3i-generation-1')
    return {
        'storage_instance_id': STORAGE_INSTANCE_ID,
        'checkpoint_key': 'event_record_index_checkpoint.v1:' + STORAGE_INSTANCE_ID,
        'checkpoint_ref': 'checkpoint:' + generation_id,
        'generation_id': generation_id,
        'generation_anchor_sha256': _hex('w3i-anchor-1'),
        'frontier_revision': sequence_id,
        'frontier_sha256': frontier_sha256,
        'index_dataset_name': 'event_record_index.v2@' + generation_id,
        'source_selection': {
            'storage_instance_id': STORAGE_INSTANCE_ID,
            'current_ref': 'storage/seglog/CURRENT',
            'current_bytes_sha256': _hex('w3i-current-1'),
            'selected_segment_generation': 1,
            'manifest_ref': 'storage/seglog/manifest.v1.msgpack',
            'manifest_bytes_sha256': _hex('w3i-manifest-1'),
            'manifest_generation': 11,
            'recovery_epoch': 3,
            'manifest_survivor_prefix_sha256': _hex('w3i-survivor-prefix-1'),
            'retained_inventory_sha256': _hex('w3i-retained-inventory-1'),
            'durable_watermarks_sha256': _hex('w3i-watermarks-1'),
            'excluded_ranges_sha256': _hex('w3i-excluded-ranges-1'),
            'retired_inputs_sha256': _hex('w3i-retired-inputs-1'),
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
        'retired_publications': list(retired),
        'hold_refs': [],
    }


def checkpoint_core(checkpoint):
    core = copy.deepcopy(checkpoint)
    core.pop('retired_publications', None)
    return core


def build_case(family, case_id, sequence_id=41):
    """One complete valid case: original observation, envelope, custody, sealed
    receipt, derived row and checkpoint, plus the boundary state inputs."""
    source = build_source(family)
    continuity_id = 'cont-w3i-' + family.split('.', 1)[1]
    fact_ref = 'fact:w3i:' + family.split('.', 1)[1] + '-v1'
    payload = build_payload(family, source, continuity_id, fact_ref)
    key, event_id = identity(family, payload)
    event = build_envelope(family, payload, source, event_id, key, sequence_id)
    record = build_storage_record(event)
    result = {'schema_id': 'pm.storage_value.continuity_append_result.v1',
              'schema_version': '1.0.0', 'event_id': event_id,
              'sequence_id': sequence_id, 'status': 'appended'}
    sealed = build_sealed_receipt(event, record, result)
    publication_id = 'pub-w3i-1'
    frontier_sha256 = _hex('w3i-frontier:' + event_id)
    projection = build_projection(event, publication_id)
    checkpoint = build_checkpoint(event, publication_id, frontier_sha256)
    return {
        'case_id': case_id,
        'family': family,
        'source': source,
        'event': event,
        'storage_record': record,
        'custody_receipt': build_custody_receipt(event, record),
        'sealed_receipts': [sealed],
        'original_ref': sealed['original_ref'],
        'projection': projection,
        'checkpoint': checkpoint,
        'frontier_sha256': frontier_sha256,
        'admitted': True,
        'dedupe_caught_up': True,
        'scope_partition': SCOPE_PARTITION,
        'prior_publication_id': 'pub-w3i-0',
        'cas_expected': 'pub-w3i-0',
        'transaction_committed': True,
        'live_state_changed': False,
        'family_withdrawn': False,
        'original_withdrawn': False,
        'disclosure_allowed': True,
        'retained_recipe_override': None,
        'retained_current_gate_applied': False,
        'receipt_created_on_read': False,
        'rebuild_matches': True,
        'compatibility_original': False,
        'replay_effects': [],
        'writer_cutoff_applied': True,
        'withdrawal_marks': 1,
        'reader_fenced': True,
        'successor_verified': True,
        'reported_outcome': 'success',
        'actual_outcome': 'success',
        'retry_event': copy.deepcopy(event),
    }


# ---- Named checks ------------------------------------------------------------------------------------------------
# Each check is one guard row: (row, boundary, refusal code, predicate). A check
# returns True when its invariant holds. Type-guarded comparisons leave a wrong
# primitive type to the schema row, so a single defect has one attributable row.

CHECKS = []


def check(row, boundary, code):
    def register(fn):
        CHECKS.append((row, boundary, code, fn))
        return fn
    return register


def _str_eq(value, expected):
    """Compare only strings; a non-string type belongs to the schema row."""
    return type(value) is not str or value == expected


def _uint64_slot(value):
    if type(value) is int:
        return 0 <= value <= UINT64_MAX
    if type(value) is float:
        return False
    return True


def _payload(case):
    return case['event'].get('payload')


@check('append_admission', 'append', 'missing_event_registration')
def append_admission(case):
    payload = _payload(case)
    return (case['admitted'] is True and case['family'] in FAMILIES
            and type(payload) is dict and payload.get('schema_version') == '1.0.0'
            and payload.get('schema_id') == PAYLOAD_SCHEMA_IDS[case['family']])


@check('append_envelope_schema', 'append', 'event_schema')
def append_envelope_schema(case):
    return schema_errors(EVENT_RECORD_ID, '', case['event']) == []


@check('append_payload_schema', 'append', 'payload_schema')
def append_payload_schema(case):
    payload = _payload(case)
    if type(payload) is not dict:
        return True
    return schema_errors(CONTINUITY_ID, '/$defs/' + PAYLOAD_DEFS[case['family']], payload) == []


@check('append_id_tokens', 'append', 'id_token_invalid')
def append_id_tokens(case):
    payload = _payload(case)
    if type(payload) is not dict:
        return True
    fields = list(PAYLOAD_ID_FIELDS)
    if 'replay_checkpoint_ref' in payload:
        fields.append('replay_checkpoint_ref')
    return all(type(payload.get(f)) is not str or id_token_ok(payload[f])
               for f in fields if f in payload)


@check('append_timestamps', 'append', 'timestamp_invalid')
def append_timestamps(case):
    event, payload = case['event'], _payload(case)
    pairs = [(event.get('occurred_at_utc'), EVENT_RECORD),
             (event.get('observed_at_utc'), STORAGE_UTC_Z),
             (event.get('persisted_at_utc'), STORAGE_UTC_Z)]
    if type(payload) is dict:
        pairs.append((payload.get('created_at_utc'), EVENT_RECORD))
    return all(type(v) is not str or timestamp_ok(v, profile) for v, profile in pairs)


@check('append_scope', 'append', 'scope_join')
def append_scope(case):
    event, payload = case['event'], _payload(case)
    if not _str_eq(event.get('scope_kind'), 'project'):
        return False
    if not _str_eq(event.get('project_id'), case['source']['project_id']):
        return False
    if type(payload) is dict and not _str_eq(payload.get('project_id'), case['source']['project_id']):
        return False
    return True


@check('append_partition', 'append', 'partition_join')
def append_partition(case):
    project_id = case['event'].get('project_id')
    if type(project_id) is not str:
        return True
    expected = 'project~' + base64.urlsafe_b64encode(project_id.encode('utf-8')).decode('ascii').rstrip('=')
    return case['scope_partition'] == expected


@check('append_source_resolved', 'append', 'source_unavailable')
def append_source_resolved(case):
    return case['source'].get('resolved') is True


@check('append_source_identity', 'append', 'source_identity_join')
def append_source_identity(case):
    payload = _payload(case)
    if type(payload) is not dict:
        return True
    source_id = payload.get('source_event_id')
    if not _str_eq(source_id, case['source']['source_event_id']):
        return False
    if case['source'].get('durably_issued') is not True:
        return False
    if type(source_id) is str and source_id == case['event'].get('event_id'):
        return False
    return True


@check('append_fact_actor', 'append', 'fact_join')
def append_fact_actor(case):
    if case['family'] != 'continuity.actor_identified':
        return True
    payload = _payload(case)
    if type(payload) is not dict:
        return True
    return (_str_eq(payload.get('actor_ref'), case['source']['principal'])
            and _str_eq(payload.get('actor_kind'), case['source']['principal_kind']))


@check('append_fact_provenance', 'append', 'fact_join')
def append_fact_provenance(case):
    if case['family'] != 'continuity.provenance_recorded':
        return True
    payload = _payload(case)
    if type(payload) is not dict:
        return True
    return (_str_eq(payload.get('provenance_ref'), case['source']['provenance_ref'])
            and case['source'].get('provenance_names_source') is True)


@check('append_fact_redaction', 'append', 'fact_join')
def append_fact_redaction(case):
    if case['family'] != 'continuity.redaction_applied':
        return True
    payload = _payload(case)
    if type(payload) is not dict:
        return True
    return (_str_eq(payload.get('redaction_profile_id'), case['source']['redaction_profile_id'])
            and _str_eq(payload.get('redaction_decision'), case['source']['redaction_decision']))


@check('append_fact_replay', 'append', 'fact_join')
def append_fact_replay(case):
    if case['family'] != 'continuity.replay_checkpointed':
        return True
    payload = _payload(case)
    if type(payload) is not dict:
        return True
    upstream = case['source']['upstream_checkpoint']
    ref = payload.get('replay_checkpoint_ref')
    if not _str_eq(ref, upstream['checkpoint_ref']):
        return False
    if upstream.get('is_downstream') is not False:
        return False
    if upstream.get('token_storage_instance_id') != STORAGE_INSTANCE_ID:
        return False
    if upstream.get('prefix_complete') is not True:
        return False
    source_id = payload.get('source_event_id')
    if type(source_id) is str and source_id not in upstream.get('prefix_event_ids', []):
        return False
    return True


@check('append_envelope_copies', 'append', 'envelope_join')
def append_envelope_copies(case):
    event, payload, source = case['event'], _payload(case), case['source']
    if type(payload) is not dict:
        return True
    copies = [('causation_event_id', payload.get('source_event_id')),
              ('parent_event_id', payload.get('source_event_id')),
              ('correlation_id', payload.get('continuity_id')),
              ('occurred_at_utc', payload.get('created_at_utc')),
              ('thread_id', source['thread_id']), ('run_id', source['run_id']),
              ('node_id', source['node_id']), ('attempt_id', source['attempt_id']),
              ('requested_account_ref', source['requested_account_ref']),
              ('effective_account_ref', source['effective_account_ref'])]
    for field, expected in copies:
        value = event.get(field)
        if value is None and expected is None:
            continue
        if type(value) is str and value == expected:
            continue
        if value is None and expected is not None:
            return False
        if type(value) is str and value != expected:
            return False
    if event.get('producer_sequence_id') is not None:
        return False
    return True


@check('append_event_id', 'append', 'identity_join')
def append_event_id(case):
    payload = _payload(case)
    if type(payload) is not dict or not all(type(payload.get(f)) is str for f in (
            'project_id', 'continuity_id', 'source_event_id', 'fact_ref')):
        return True
    _, event_id = identity(case['family'], payload)
    return _str_eq(case['event'].get('event_id'), event_id)


@check('append_idempotency_key', 'append', 'idempotency_key_join')
def append_idempotency_key(case):
    payload = _payload(case)
    if type(payload) is not dict or not all(type(payload.get(f)) is str for f in (
            'project_id', 'continuity_id', 'source_event_id', 'fact_ref')):
        return True
    key, _ = identity(case['family'], payload)
    return _str_eq(case['event'].get('idempotency_key'), key)


@check('append_replay_only', 'append', 'replay_only_not_appendable')
def append_replay_only(case):
    policy = case['event'].get('replay_policy')
    return not (type(policy) is str and policy == 'projector_replay_only')


@check('append_replay_policy', 'append', 'family_current_replay_policy')
def append_replay_policy(case):
    policy = case['event'].get('replay_policy')
    return not (type(policy) is str and policy in ('append_once', 'dedupe_by_event_id'))


@check('append_dedupe', 'append', 'dedupe_unavailable')
def append_dedupe(case):
    return case['dedupe_caught_up'] is True


@check('append_semantic_digest', 'append', 'semantic_digest_join')
def append_semantic_digest(case):
    try:
        expected = producer_semantic_digest(case['event'])
    except Refusal:
        return True
    return case['custody_receipt'].get('producer_semantic_digest') == expected


@check('append_sequence_uint64', 'append', 'number_domain')
def append_sequence_uint64(case):
    return _uint64_slot(case['event'].get('sequence_id'))


@check('append_full_value', 'append', 'full_value_join')
def append_full_value(case):
    try:
        expected = full_value_commitment(case['event'])
    except Refusal:
        return True
    commitment = case['custody_receipt'].get('original_event_value_commitment', {})
    return commitment.get('sha256') == expected


@check('append_receipt', 'append', 'receipt_join')
def append_receipt(case):
    receipt = case['custody_receipt'].get('first_append_receipt')
    if type(receipt) is not dict:
        return False
    record = case['storage_record']
    for field in build_first_receipt(record):
        if receipt.get(field) != record[field]:
            return False
    custody = case['custody_receipt']
    project_id = case['event'].get('project_id')
    expected_partition = case['scope_partition']
    if type(project_id) is str:
        expected_partition = 'project~' + base64.urlsafe_b64encode(project_id.encode('utf-8')).decode('ascii').rstrip('=')
    return (custody.get('event_id') == case['event'].get('event_id')
            and custody.get('idempotency_key') == case['event'].get('idempotency_key')
            and custody.get('event_type') == case['family']
            and custody.get('scope_partition') == expected_partition)


@check('append_pack', 'append', 'pack_join')
def append_pack(case):
    if case['event'].get('payload_ref') is None:
        return True
    pack = case.get('payload_pack')
    if type(pack) is not dict:
        return False
    try:
        verify_payload_bytes(bytes.fromhex(pack['raw_hex']), byte_size=pack['byte_size'],
                             payload_id=pack['payload_id'], media_type=pack['media_type'],
                             expected_media_type='application/json')
    except (Refusal, KeyError, ValueError):
        return False
    return case['event']['payload_ref'] == 'blake3:' + pack['payload_id']


@check('append_inline_limit', 'append', 'payload_inline_limit')
def append_inline_limit(case):
    if case['event'].get('payload_ref') is not None:
        return True
    payload = _payload(case)
    if type(payload) is not dict:
        return True
    return len(pack_value(payload)) <= INLINE_LIMIT


# ---- Retry boundary ----------------------------------------------------------------------------------------------

@check('retry_identity', 'retry', 'retry_identity_join')
def retry_identity(case):
    retry = case['retry_event']
    return (_str_eq(retry.get('event_id'), case['event'].get('event_id'))
            and _str_eq(retry.get('idempotency_key'), case['event'].get('idempotency_key')))


@check('retry_semantic', 'retry', 'idempotency_conflict')
def retry_semantic(case):
    try:
        original = producer_semantic_digest(case['event'])
        incoming = producer_semantic_digest(case['retry_event'])
    except Refusal:
        return True
    return original == incoming


@check('retry_replay_only', 'retry', 'replay_only_not_appendable')
def retry_replay_only(case):
    policy = case['retry_event'].get('replay_policy')
    return not (type(policy) is str and policy == 'projector_replay_only')


@check('retry_custody', 'retry', 'receipt_join')
def retry_custody(case):
    sealed = case['sealed_receipts'][0] if case['sealed_receipts'] else None
    if sealed is None:
        return False
    return case.get('retry_returned_receipt_hex', sealed['receipt_hex']) == sealed['receipt_hex']


@check('retry_no_new_event', 'retry', 'retry_transition')
def retry_no_new_event(case):
    return case.get('retry_sequence_unchanged', True) is True


# ---- Derived projection/checkpoint boundary ----------------------------------------------------------------------

@check('projection_schema', 'derived', 'projection_schema')
def projection_schema(case):
    return schema_errors(CONTINUITY_ID, '/$defs/projection', case['projection']) == []


@check('projection_join', 'derived', 'projection_join')
def projection_join(case):
    projection, event, payload = case['projection'], case['event'], _payload(case)
    if type(payload) is not dict:
        return True
    return (_str_eq(projection.get('event_id'), event.get('event_id'))
            and _str_eq(projection.get('body_event_id'), event.get('event_id'))
            and _str_eq(projection.get('project_id'), payload.get('project_id'))
            and _str_eq(projection.get('continuity_id'), payload.get('continuity_id'))
            and _str_eq(projection.get('stream_id'), payload.get('stream_id'))
            and _str_eq(projection.get('event_type'), case['family'])
            and projection.get('sequence_id') == event.get('sequence_id')
            and _str_eq(projection.get('publication_id'), case['checkpoint'].get('publication_id')))


@check('checkpoint_schema', 'derived', 'checkpoint_schema')
def checkpoint_schema(case):
    return schema_errors(CONTINUITY_ID, '/$defs/checkpoint', case['checkpoint']) == []


@check('checkpoint_token', 'derived', 'token_join')
def checkpoint_token(case):
    token = case['checkpoint'].get('index_read_token')
    if type(token) is not dict:
        return True
    selection = token.get('source_selection', {})
    if type(selection) is not dict:
        return True
    hex_fields = ['generation_anchor_sha256', 'frontier_sha256']
    hex_fields += ['current_bytes_sha256', 'manifest_bytes_sha256', 'manifest_survivor_prefix_sha256',
                   'retained_inventory_sha256', 'durable_watermarks_sha256', 'excluded_ranges_sha256',
                   'retired_inputs_sha256']
    for field in hex_fields:
        value = token.get(field) if field in token else selection.get(field)
        if type(value) is str and not hex64_ok(value):
            return False
    instance = token.get('storage_instance_id')
    if type(instance) is str and UUID_TOKEN.fullmatch(instance) is None:
        return False
    generation = token.get('generation_id')
    if type(generation) is str and GENERATION_ID.fullmatch(generation) is None:
        return False
    if type(instance) is str and token.get('checkpoint_key') != 'event_record_index_checkpoint.v1:' + instance:
        return False
    if type(generation) is str and token.get('index_dataset_name') != 'event_record_index.v2@' + generation:
        return False
    if token.get('frontier_revision') != case['checkpoint'].get('index_through_sequence_id'):
        return False
    return True


@check('checkpoint_prefix', 'derived', 'prefix_coverage')
def checkpoint_prefix(case):
    checkpoint = case['checkpoint']
    token = checkpoint.get('index_read_token', {})
    return (checkpoint.get('filter_complete') is True
            and token.get('frontier_sha256') == case['frontier_sha256']
            and checkpoint.get('index_through_sequence_id') == case['event'].get('sequence_id'))


@check('checkpoint_cursor', 'derived', 'cursor_join')
def checkpoint_cursor(case):
    cursor = case['checkpoint'].get('source_cursor')
    if type(cursor) is not dict:
        return True
    name = cursor.get('segment_name')
    if type(name) is str and SEGMENT_NAME.fullmatch(name) is None:
        return False
    selection = case['checkpoint'].get('index_read_token', {}).get('source_selection', {})
    if cursor.get('segment_generation') != selection.get('selected_segment_generation'):
        return False
    if cursor.get('last_sequence_id') != case['event'].get('sequence_id'):
        return False
    if not _str_eq(cursor.get('last_event_id'), case['event'].get('event_id')):
        return False
    start, end = cursor.get('byte_offset'), cursor.get('frame_end_offset')
    if type(start) is int and type(end) is int and start > end:
        return False
    return True


@check('checkpoint_cas', 'derived', 'cas_conflict')
def checkpoint_cas(case):
    return case['cas_expected'] == case['prior_publication_id']


@check('checkpoint_atomic', 'derived', 'transaction_failed')
def checkpoint_atomic(case):
    return case['transaction_committed'] is True


@check('checkpoint_size', 'derived', 'derived_value_limit')
def checkpoint_size(case):
    try:
        return (len(pack_value(case['projection'])) <= INLINE_LIMIT
                and len(pack_value(case['checkpoint'])) <= INLINE_LIMIT)
    except Refusal:
        # A number-domain defect makes the value unencodable; the number row owns it.
        return True


@check('checkpoint_retired', 'derived', 'retired_publication')
def checkpoint_retired(case):
    retired = case['checkpoint'].get('retired_publications')
    if type(retired) is not list:
        return True
    if len(retired) > RETIRED_LIMIT:
        return False
    for core in retired:
        if type(core) is not dict:
            return False
        if schema_errors(CONTINUITY_ID, '/$defs/checkpoint_core', core) != []:
            return False
        if core.get('state') != 'withdrawn' or core.get('withdrawn_at_utc') is None:
            return False
        if core.get('index_read_token', {}).get('storage_instance_id') != STORAGE_INSTANCE_ID:
            return False
    return True


@check('checkpoint_state', 'derived', 'checkpoint_state_join')
def checkpoint_state(case):
    checkpoint = case['checkpoint']
    state, withdrawn = checkpoint.get('state'), checkpoint.get('withdrawn_at_utc')
    if state == 'current':
        return withdrawn is None
    if state == 'withdrawn':
        return type(withdrawn) is str and timestamp_ok(withdrawn, EVENT_RECORD)
    return True


@check('derived_numbers', 'derived', 'number_domain')
def derived_numbers(case):
    checkpoint = case['checkpoint']
    token = checkpoint.get('index_read_token', {})
    selection = token.get('source_selection', {}) if type(token) is dict else {}
    cursor = checkpoint.get('source_cursor') if type(checkpoint.get('source_cursor')) is dict else {}
    slots = [case['projection'].get('sequence_id'), checkpoint.get('index_through_sequence_id')]
    if type(token) is dict:
        slots.append(token.get('frontier_revision'))
    if type(selection) is dict:
        slots += [selection.get('selected_segment_generation'), selection.get('manifest_generation'),
                  selection.get('recovery_epoch')]
    slots += [cursor.get('segment_generation'), cursor.get('byte_offset'),
              cursor.get('frame_end_offset'), cursor.get('last_sequence_id')]
    return all(_uint64_slot(v) for v in slots)


# ---- Withdrawal / rebuild boundary -------------------------------------------------------------------------------

@check('withdrawal_cutoff', 'withdrawal', 'writer_cutoff')
def withdrawal_cutoff(case):
    return case['writer_cutoff_applied'] is True


@check('withdrawal_once', 'withdrawal', 'withdrawal_once')
def withdrawal_once(case):
    return case['withdrawal_marks'] == 1


@check('withdrawal_fence', 'withdrawal', 'publication_withdrawn')
def withdrawal_fence(case):
    return case['reader_fenced'] is True


@check('successor_rebuild', 'withdrawal', 'successor_rebuild')
def successor_rebuild(case):
    return case['successor_verified'] is True


@check('replay_audit_only', 'withdrawal', 'replay_external_effect')
def replay_audit_only(case):
    return case['replay_effects'] == []


@check('outcome_honest', 'withdrawal', 'outcome_mismatch')
def outcome_honest(case):
    return case['reported_outcome'] == case['actual_outcome']


BOUNDARIES = ('append', 'retry', 'retained', 'derived', 'withdrawal')


def boundary_errors(case, boundary):
    """Every refusal code of one boundary, in table order (no early stop)."""
    return [code for row, b, code, fn in CHECKS if b == boundary and fn(case) is not True]


def compute_verdicts(case):
    return {row: fn(case) is True for row, _b, _code, fn in CHECKS}


# ---- Retained reads: SP-1101 sealed-receipt dispatch -------------------------------------------------------------
# The recipe is selected only from the independently sealed receipt for the exact
# original. A missing or ambiguous receipt preserves the bytes and returns
# unavailable; no receipt is created while reading; the current writer gate never
# runs on a retained original.

class SealedReceiptOwner:
    """Resolves the sealed receipt for one exact original_ref. Trusted composition:
    it reads the sealed store, never a caller-supplied custody object."""

    def __init__(self, sealed_receipts):
        self._sealed = sealed_receipts

    def authenticated_original(self, original_ref):
        matches = [r for r in self._sealed if r['original_ref'] == original_ref]
        if not matches:
            raise Refusal('original_receipt_missing')
        if len(matches) > 1:
            raise Refusal('original_receipt_ambiguous')
        sealed = matches[0]
        binding = OriginalBinding(**sealed['binding'])
        recipe = RecipeTuple(**sealed['recipe'])
        return OriginalCustody(
            binding=binding, recipe=recipe,
            record_bytes=bytes.fromhex(sealed['record_hex']),
            result_bytes=bytes.fromhex(sealed['result_hex']),
            receipt_bytes=bytes.fromhex(sealed['receipt_hex']),
        )


def _frozen_verify(custody):
    """Recompute every original join with the sealed recipe's resources. No
    current-writer or live-state validation reaches the original."""
    try:
        record = decode_storage_value(custody.record_bytes, profile=EVENT_VALUE)
        receipt = decode_storage_value(custody.receipt_bytes, profile=EVENT_VALUE)
        result = decode_storage_value(custody.result_bytes, profile=EVENT_VALUE)
        family = record['event_type']
        key, event_id = identity(family, record['payload'])
        if custody.binding.event_id != event_id or custody.binding.idempotency_key != key:
            return False
        if full_value_commitment(record) != custody.binding.source_commitment:
            return False
        if receipt.get('producer_semantic_digest') != producer_semantic_digest(record):
            return False
        if receipt.get('original_event_value_commitment', {}).get('sha256') != full_value_commitment(record):
            return False
        if receipt.get('event_id') != event_id or result.get('event_id') != event_id:
            return False
        pointer = '/$defs/' + PAYLOAD_DEFS[family]
        if schema_errors(CONTINUITY_ID, pointer, record['payload']) != []:
            return False
    except (Refusal, KeyError, ValueError, TypeError):
        return False
    return True


FROZEN_RECIPES = {recipe_tuple(family): FrozenRecipe(verify_original=_frozen_verify) for family in FAMILIES}


def retained_resolution(case):
    """Run the dispatcher; return (custody_or_None, refusal_reason_or_None)."""
    if case['retained_recipe_override'] is not None:
        return None, 'caller_recipe_override'
    owner = SealedReceiptOwner(case['sealed_receipts'])
    dispatcher = RetainedDispatcher(owner, FROZEN_RECIPES)
    try:
        expected = original_binding(case['event'])
        custody = dispatcher.resolve(case['original_ref'], expected,
                                     disclose=lambda binding: case['disclosure_allowed'] is True)
    except Refusal as refusal:
        return None, refusal.reason
    return custody, None


def retained_original_verifies(case):
    matches = [r for r in case['sealed_receipts'] if r['original_ref'] == case['original_ref']]
    if len(matches) != 1:
        return False
    sealed = matches[0]
    try:
        custody = OriginalCustody(
            binding=OriginalBinding(**sealed['binding']), recipe=RecipeTuple(**sealed['recipe']),
            record_bytes=bytes.fromhex(sealed['record_hex']),
            result_bytes=bytes.fromhex(sealed['result_hex']),
            receipt_bytes=bytes.fromhex(sealed['receipt_hex']))
    except (Refusal, KeyError, ValueError, TypeError):
        return False
    return _frozen_verify(custody)


@check('retained_receipt_present', 'retained', 'original_receipt_missing')
def retained_receipt_present(case):
    return retained_resolution(case)[1] != 'original_receipt_missing'


@check('retained_receipt_unique', 'retained', 'original_receipt_ambiguous')
def retained_receipt_unique(case):
    return retained_resolution(case)[1] != 'original_receipt_ambiguous'


@check('retained_receipt_binding', 'retained', 'original_binding')
def retained_receipt_binding(case):
    return retained_resolution(case)[1] != 'original_binding'


@check('retained_recipe_override', 'retained', 'caller_recipe_override')
def retained_recipe_override(case):
    return case['retained_recipe_override'] is None


@check('retained_recipe_known', 'retained', 'recipe_unknown')
def retained_recipe_known(case):
    return retained_resolution(case)[1] != 'recipe_unknown'


@check('retained_frozen_verify', 'retained', 'original_verification')
def retained_frozen_verify(case):
    return retained_resolution(case)[1] != 'original_verification'


@check('retained_disclosure', 'retained', 'current_disclosure')
def retained_disclosure(case):
    return retained_resolution(case)[1] != 'current_disclosure'



@check('retained_no_current_gate', 'retained', 'retained_current_gate')
def retained_no_current_gate(case):
    return case['retained_current_gate_applied'] is False


@check('retained_no_receipt_creation', 'retained', 'receipt_created_on_read')
def retained_no_receipt_creation(case):
    return case['receipt_created_on_read'] is False


@check('retained_withdrawn', 'retained', 'historical_withdrawn')
def retained_withdrawn(case):
    return case['family_withdrawn'] is False and case['original_withdrawn'] is False


@check('retained_rebuild', 'retained', 'historical_rebuild')
def retained_rebuild(case):
    return case['rebuild_matches'] is True


def all_errors(case):
    """Every refusal across all boundaries, in table order."""
    return [code for _row, _b, code, fn in CHECKS if fn(case) is not True]


# ---- Dependent-copy resync ---------------------------------------------------------------------------------------
# A negative changes exactly one input invariant. Dependent copies, hashes, keys
# and post-state are recomputed from the changed value so the only refusal is the
# guard whose independent source the change contradicts. The source observation
# and the sealed original are never resynced: they are the independent authority.

def resync(case, recompute_identity=True):
    event = case['event']
    payload = event['payload']
    if recompute_identity and type(payload) is dict:
        key, event_id = identity(case['family'], payload)
        event['idempotency_key'] = key
        event['event_id'] = event_id
    record = build_storage_record(event)
    case['storage_record'] = record
    try:
        case['custody_receipt'] = build_custody_receipt(event, record)
        result = {'schema_id': 'pm.storage_value.continuity_append_result.v1',
                  'schema_version': '1.0.0', 'event_id': event['event_id'],
                  'sequence_id': event['sequence_id'], 'status': 'appended'}
        case['sealed_receipts'] = [build_sealed_receipt(event, record, result)]
        case['original_ref'] = case['sealed_receipts'][0]['original_ref']
    except Refusal:
        # The shared codec refuses the changed value (out-of-range integer or
        # wrong edition). The number/schema row owns that refusal; keep the
        # receipt's Storage-assigned fields consistent with the record so the
        # receipt join does not also refuse.
        custody = case['custody_receipt']
        custody['first_append_receipt'] = build_first_receipt(record)
        custody['event_id'] = event.get('event_id')
        custody['idempotency_key'] = event.get('idempotency_key')
        custody['event_type'] = case['family']
    publication_id = case['checkpoint']['publication_id']
    case['projection'] = build_projection(event, publication_id)
    frontier = _hex('w3i-frontier:' + str(event['event_id']))
    case['frontier_sha256'] = frontier
    retired = case['checkpoint'].get('retired_publications', [])
    case['checkpoint'] = build_checkpoint(event, publication_id, frontier, retired=retired)
    case['retry_event'] = copy.deepcopy(event)
    return case


def with_pack(case):
    """Externalize the event body through SP-337: an immutable BLAKE3 payload pack
    and exact payload_ref. The logical body and semantic digest are unchanged."""
    raw = pack_value(case['event']['payload'])
    payload_id = blake3.blake3(raw).digest().hex()
    case['payload_pack'] = {'raw_hex': raw.hex(), 'byte_size': len(raw),
                            'payload_id': payload_id, 'media_type': 'application/json'}
    case['event']['payload_ref'] = 'blake3:' + payload_id
    resync(case)
    return case


def build_controls():
    """Valid originals: one per family per boundary, plus retained/compatibility
    and live-state-change controls."""
    controls = []
    for family in FAMILIES:
        base = build_case(family, 'control:' + family)
        controls.append(('append:' + family, copy.deepcopy(base)))
        controls.append(('pack:' + family, with_pack(copy.deepcopy(base))))
        controls.append(('retry:' + family, copy.deepcopy(base)))
        controls.append(('derived:' + family, copy.deepcopy(base)))
        controls.append(('withdrawal:' + family, copy.deepcopy(base)))
        retained = copy.deepcopy(base)
        controls.append(('retained:' + family, retained))
        live = copy.deepcopy(base)
        live['live_state_changed'] = True
        controls.append(('retained-live:' + family, live))
        compat = copy.deepcopy(base)
        compat['compatibility_original'] = True
        compat['event']['replay_policy'] = 'projector_replay_only'
        resync(compat)
        controls.append(('compatibility:' + family, compat))
    return controls


# A payload id field that no fact row, identity tuple or derived join reads, per
# family, so an alphabet defect has one attributable row.
FREE_ID_FIELD = {
    'continuity.actor_identified': 'provenance_ref',
    'continuity.provenance_recorded': 'actor_ref',
    'continuity.redaction_applied': 'actor_ref',
    'continuity.replay_checkpointed': 'actor_ref',
}


def _oversize_inline_time(case):
    ts = '2026-11-05T10:00:00.' + '0' * 20000 + 'Z'
    case['event']['payload']['created_at_utc'] = ts
    case['event']['occurred_at_utc'] = ts


def build_negatives():
    """One single-defect witness per reachable row, from a named valid control."""
    negatives = []

    def add(row, boundary, family, control_id, mutate, resync_mode='full'):
        base = next(c for cid, c in controls if cid == control_id)
        bad = copy.deepcopy(base)
        mutate(bad)
        if resync_mode == 'full':
            resync(bad)
        elif resync_mode == 'no_identity':
            resync(bad, recompute_identity=False)
        negatives.append((row, boundary, family, control_id, bad))

    for family in FAMILIES:
        ac = 'append:' + family
        rc = 'retry:' + family
        dc = 'derived:' + family
        wc = 'withdrawal:' + family
        tc = 'retained:' + family
        free = FREE_ID_FIELD[family]

        # Append boundary.
        add('append_admission', 'append', family, ac, lambda c: c.update(admitted=False), 'none')
        add('append_envelope_schema', 'append', family, ac,
            lambda c: c['event'].update(schema_version='1.0.0'), 'none')
        add('append_payload_schema', 'append', family, ac,
            lambda c: c['event']['payload'].update(extra_member=1))
        add('append_id_tokens', 'append', family, ac,
            lambda c: c['event']['payload'].update({free: 'token-w3i\n'}))
        add('append_timestamps', 'append', family, ac,
            lambda c: c['event'].update(observed_at_utc='2026-11-05T10:00:01+00:00'))
        # SW-F1 / CV-1101: malformed Storage-profile times (uppercase-Z only) and
        # malformed EventRecord times, each a single defect on an independent field.
        add('append_timestamps', 'append', family, ac,
            lambda c: c['event'].update(observed_at_utc='2026-11-05T10:00:01z'))
        add('append_timestamps', 'append', family, ac,
            lambda c: c['event'].update(persisted_at_utc='2026-11-05T10:00:02+00:00'))
        add('append_timestamps', 'append', family, ac,
            lambda c: c['event'].update(observed_at_utc='2026-11-05T24:00:01Z'))
        add('append_timestamps', 'append', family, ac,
            lambda c: c['event'].update(observed_at_utc='2026-11-05T10:00:01Z\n'))
        add('append_timestamps', 'append', family, ac,
            lambda c: c['event'].update(observed_at_utc='2026-11-05T10:00:01'))
        add('append_scope', 'append', family, ac,
            lambda c: c['source'].update(project_id='p-other'), 'none')
        add('append_partition', 'append', family, ac,
            lambda c: c.update(scope_partition='project~wrongpartition'), 'none')
        add('append_source_resolved', 'append', family, ac,
            lambda c: c['source'].update(resolved=False), 'none')
        add('append_source_identity', 'append', family, ac,
            lambda c: c['source'].update(source_event_id='evt_source_other'))
        add('append_envelope_copies', 'append', family, ac,
            lambda c: c['event'].update(correlation_id='cont-other'))
        add('append_event_id', 'append', family, ac,
            lambda c: c['event'].update(event_id='evt_continuity_' + '0' * 64), 'no_identity')
        add('append_idempotency_key', 'append', family, ac,
            lambda c: c['event'].update(idempotency_key='continuity@1:' + '0' * 64), 'no_identity')
        add('append_replay_only', 'append', family, ac,
            lambda c: c['event'].update(replay_policy='projector_replay_only'))
        add('append_replay_policy', 'append', family, ac,
            lambda c: c['event'].update(replay_policy='append_once'))
        add('append_dedupe', 'append', family, ac, lambda c: c.update(dedupe_caught_up=False), 'none')
        add('append_semantic_digest', 'append', family, ac,
            lambda c: c['custody_receipt'].update(producer_semantic_digest='0' * 64), 'none')
        add('append_sequence_uint64', 'append', family, ac,
            lambda c: c['event'].update(sequence_id=UINT64_MAX + 1), 'none')
        add('append_full_value', 'append', family, ac,
            lambda c: c['custody_receipt']['original_event_value_commitment'].update(sha256='0' * 64), 'none')
        add('append_receipt', 'append', family, ac,
            lambda c: c['custody_receipt']['first_append_receipt'].update(sequence_id=999), 'none')
        add('append_pack', 'append', family, 'pack:' + family,
            lambda c: c['payload_pack'].update(raw_hex='00' + c['payload_pack']['raw_hex'][2:]), 'none')
        # The EventRecord profile admits arbitrary fractional precision, so a
        # valid oversized-fraction source time makes the inline body exceed 16 KiB.
        # occurred_at_utc is the dependent copy of created_at_utc, refreshed here.
        add('append_inline_limit', 'append', family, ac, _oversize_inline_time)

        # Family fact row.
        fact_row = {'continuity.actor_identified': 'append_fact_actor',
                    'continuity.provenance_recorded': 'append_fact_provenance',
                    'continuity.redaction_applied': 'append_fact_redaction',
                    'continuity.replay_checkpointed': 'append_fact_replay'}[family]
        if family == 'continuity.actor_identified':
            add(fact_row, 'append', family, ac,
                lambda c: c['event']['payload'].update(actor_ref='user:other'))
        elif family == 'continuity.provenance_recorded':
            add(fact_row, 'append', family, ac,
                lambda c: c['source'].update(provenance_names_source=False), 'none')
        elif family == 'continuity.redaction_applied':
            add(fact_row, 'append', family, ac,
                lambda c: c['event']['payload'].update(redaction_decision='requested'))
        else:
            add(fact_row, 'append', family, ac,
                lambda c: c['source']['upstream_checkpoint'].update(is_downstream=True), 'none')

        # Retry boundary.
        add('retry_identity', 'retry', family, rc,
            lambda c: c['retry_event'].update(event_id='evt_continuity_' + '1' * 64), 'none')
        add('retry_semantic', 'retry', family, rc,
            lambda c: c['retry_event']['payload'].update(actor_ref='user:other'), 'none')
        add('retry_replay_only', 'retry', family, rc,
            lambda c: c['retry_event'].update(replay_policy='projector_replay_only'), 'none')
        add('retry_custody', 'retry', family, rc,
            lambda c: c.update(retry_returned_receipt_hex='00' * 32), 'none')
        add('retry_no_new_event', 'retry', family, rc,
            lambda c: c.update(retry_sequence_unchanged=False), 'none')

        # Derived boundary.
        add('projection_schema', 'derived', family, dc,
            lambda c: c['projection'].update(extra_member=1), 'none')
        add('projection_join', 'derived', family, dc,
            lambda c: c['projection'].update(body_event_id='evt_other'), 'none')
        add('checkpoint_schema', 'derived', family, dc,
            lambda c: c['checkpoint'].update(extra_member=1), 'none')
        add('checkpoint_token', 'derived', family, dc,
            lambda c: c['checkpoint']['index_read_token'].update(generation_id='eig_' + 'g' * 64), 'none')
        add('checkpoint_prefix', 'derived', family, dc,
            lambda c: c.update(frontier_sha256='0' * 64), 'none')
        add('checkpoint_cursor', 'derived', family, dc,
            lambda c: c['checkpoint']['source_cursor'].update(segment_name='not-a-segment'), 'none')
        # SW-F1: trailing-LF single-defect witnesses for the copied token/cursor
        # identifiers (full-match grammars refuse what an anchored pattern accepted).
        add('checkpoint_token', 'derived', family, dc,
            lambda c: c['checkpoint']['index_read_token'].update(
                generation_id=c['checkpoint']['index_read_token']['generation_id'] + '\n'), 'none')
        add('checkpoint_token', 'derived', family, dc,
            lambda c: c['checkpoint']['index_read_token'].update(
                generation_anchor_sha256=c['checkpoint']['index_read_token']['generation_anchor_sha256'] + '\n'),
            'none')
        add('checkpoint_token', 'derived', family, dc,
            lambda c: c['checkpoint']['index_read_token'].update(
                storage_instance_id=c['checkpoint']['index_read_token']['storage_instance_id'] + '\n'), 'none')
        add('checkpoint_cursor', 'derived', family, dc,
            lambda c: c['checkpoint']['source_cursor'].update(
                segment_name=c['checkpoint']['source_cursor']['segment_name'] + '\n'), 'none')
        add('checkpoint_cas', 'derived', family, dc, lambda c: c.update(cas_expected='pub-other'), 'none')
        add('checkpoint_atomic', 'derived', family, dc,
            lambda c: c.update(transaction_committed=False), 'none')
        add('checkpoint_size', 'derived', family, dc,
            lambda c: c['checkpoint']['index_read_token'].update(checkpoint_ref='r' * 20000), 'none')
        add('checkpoint_retired', 'derived', family, dc, lambda c: c['checkpoint'].update(
            retired_publications=[checkpoint_core(c['checkpoint'])]), 'none')
        add('checkpoint_state', 'derived', family, dc,
            lambda c: c['checkpoint'].update(withdrawn_at_utc=WITHDRAW_TIME), 'none')
        add('derived_numbers', 'derived', family, dc,
            lambda c: c['checkpoint']['index_read_token']['source_selection'].update(recovery_epoch=3.0),
            'none')

        # Withdrawal boundary.
        add('withdrawal_cutoff', 'withdrawal', family, wc,
            lambda c: c.update(writer_cutoff_applied=False), 'none')
        add('withdrawal_once', 'withdrawal', family, wc, lambda c: c.update(withdrawal_marks=2), 'none')
        add('withdrawal_fence', 'withdrawal', family, wc, lambda c: c.update(reader_fenced=False), 'none')
        add('successor_rebuild', 'withdrawal', family, wc, lambda c: c.update(successor_verified=False), 'none')
        add('replay_audit_only', 'withdrawal', family, wc,
            lambda c: c.update(replay_effects=['scheduler_wake']), 'none')
        add('outcome_honest', 'withdrawal', family, wc, lambda c: c.update(actual_outcome='failed'), 'none')

        # Retained boundary.
        add('retained_receipt_present', 'retained', family, tc,
            lambda c: c.update(sealed_receipts=[]), 'none')
        add('retained_receipt_unique', 'retained', family, tc,
            lambda c: c.update(sealed_receipts=[c['sealed_receipts'][0], copy.deepcopy(c['sealed_receipts'][0])]),
            'none')
        add('retained_recipe_override', 'retained', family, tc,
            lambda c: c.update(retained_recipe_override='caller-selected-recipe'), 'none')
        add('retained_recipe_known', 'retained', family, tc,
            lambda c: c['sealed_receipts'][0]['recipe'].update(identity_recipe='unknown-recipe'), 'none')
        add('retained_frozen_verify', 'retained', family, tc,
            lambda c: c['sealed_receipts'][0].update(record_hex='00' + c['sealed_receipts'][0]['record_hex'][2:]),
            'none')
        add('retained_disclosure', 'retained', family, tc,
            lambda c: c.update(disclosure_allowed=False), 'none')
        add('retained_no_current_gate', 'retained', family, tc,
            lambda c: c.update(retained_current_gate_applied=True), 'none')
        add('retained_no_receipt_creation', 'retained', family, tc,
            lambda c: c.update(receipt_created_on_read=True), 'none')
        add('retained_withdrawn', 'retained', family, tc, lambda c: c.update(family_withdrawn=True), 'none')
        add('retained_rebuild', 'retained', family, tc, lambda c: c.update(rebuild_matches=False), 'none')

    # Wrong-original receipt: a sealed receipt for another original presented under
    # the requested original_ref. The other original is internally valid, so only
    # the binding join refuses.
    for family in FAMILIES:
        other_family = next(f for f in FAMILIES if f != family)
        other = build_case(other_family, 'other-original:' + other_family)
        base = next(c for cid, c in controls if cid == 'retained:' + family)
        bad = copy.deepcopy(base)
        wrong = copy.deepcopy(other['sealed_receipts'][0])
        wrong['original_ref'] = bad['original_ref']
        bad['sealed_receipts'] = [wrong]
        negatives.append(('retained_receipt_binding', 'retained', family, 'retained:' + family, bad))

    return negatives


controls = build_controls()
negatives = build_negatives()


# ---- Shared number corpus through the complete checker -----------------------------------------------------------

def corpus_number_values():
    """Number-scope raw spellings and exact integers of the shared corpus, plus
    three 4,400-digit integers (the DX/DS15/DF/DM/DCO crash class)."""
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
    try:
        storage_uint64(value)
        return True
    except Refusal:
        return False


def _load_case_sequence(base, token):
    case = copy.deepcopy(base)
    case['event']['sequence_id'] = '__W3I_SEQUENCE__'
    text = json.dumps(case).replace('"__W3I_SEQUENCE__"', token)
    return loads_current_json(text)


def corpus_number_checks():
    """Every shared number value enters through the checker's own raw ingress at
    the Storage sequence slot and runs the complete append route. The expectation
    is composed from the shared helpers alone; 0 disagreements is the credit."""
    raws, ints = corpus_number_values()
    totals = {'accepted': 0, 'refused': 0, 'load_refused': 0}
    bases = [next(c for cid, c in controls if cid == 'append:' + family) for family in FAMILIES]
    for base in bases:
        for token in raws + ints:
            expected = _expected_sequence_accept(token)
            try:
                loaded = _load_case_sequence(base, token)
            except Refusal:
                assert not expected, (base['family'], token[:40])
                totals['load_refused'] += 1
                continue
            resync(loaded)
            errors = boundary_errors(loaded, 'append')
            actual = errors == []
            assert actual == expected, (base['family'], token[:40], errors, expected)
            totals['accepted' if actual else 'refused'] += 1
    return totals, len(raws), len(ints)


def long_integer_checks():
    """A valid 4,400-digit integer is refused with a code on every route; none
    raises (the crash class DX/DS15/DF/DM/DCO found)."""
    long = JsonNumber('1' + '0' * 4399, True).exact()
    checks = 0
    for family in FAMILIES:
        base = next(c for cid, c in controls if cid == 'append:' + family)
        for value in (long, -long):
            bad = copy.deepcopy(base)
            bad['event']['sequence_id'] = value
            resync(bad)
            errors = boundary_errors(bad, 'append')
            assert 'number_domain' in errors, (family, errors)
            checks += 1
            derived = copy.deepcopy(base)
            derived['projection']['sequence_id'] = value
            derived['checkpoint']['index_through_sequence_id'] = value
            errors = boundary_errors(derived, 'derived')
            assert 'number_domain' in errors, (family, errors)
            checks += 1
    return checks


def dispatch_checks():
    """SP-1101: the sealed receipt for the exact original selects the recipe. A
    missing, ambiguous or wrong-original receipt, or a caller override, refuses."""
    checks = 0
    for family in FAMILIES:
        base = next(c for cid, c in controls if cid == 'retained:' + family)
        custody, reason = retained_resolution(base)
        assert reason is None and custody is not None, (family, reason)
        checks += 1
        missing = copy.deepcopy(base); missing['sealed_receipts'] = []
        assert retained_resolution(missing)[1] == 'original_receipt_missing'
        checks += 1
        ambiguous = copy.deepcopy(base)
        ambiguous['sealed_receipts'] = [base['sealed_receipts'][0], copy.deepcopy(base['sealed_receipts'][0])]
        assert retained_resolution(ambiguous)[1] == 'original_receipt_ambiguous'
        checks += 1
        other_family = next(f for f in FAMILIES if f != family)
        other = build_case(other_family, 'dispatch-other:' + other_family)
        wrong = copy.deepcopy(base)
        wrong_receipt = copy.deepcopy(other['sealed_receipts'][0])
        wrong_receipt['original_ref'] = wrong['original_ref']
        wrong['sealed_receipts'] = [wrong_receipt]
        assert retained_resolution(wrong)[1] == 'original_binding'
        checks += 1
        override = copy.deepcopy(base); override['retained_recipe_override'] = 'caller-recipe'
        assert retained_resolution(override)[1] == 'caller_recipe_override'
        checks += 1
    return checks


def main():
    failures = []
    eager = {'continuity': eager_refs(CONTINUITY_SCHEMA), 'event_record': eager_refs(EVENT_RECORD_SCHEMA)}
    control_checks = 0
    bmap = {'append': 'append', 'pack': 'append', 'retry': 'retry', 'derived': 'derived',
            'withdrawal': 'withdrawal', 'retained': 'retained', 'retained-live': 'retained',
            'compatibility': 'retained'}
    for cid, case in controls:
        errors = boundary_errors(case, bmap[cid.split(':')[0]])
        control_checks += 1
        if errors:
            failures.append({'control': cid, 'errors': errors})
    codes = {row: code for row, _b, code, _fn in CHECKS}
    negative_checks = 0
    for row, boundary, family, control_id, bad in negatives:
        errors = boundary_errors(bad, boundary)
        negative_checks += 1
        if errors != [codes[row]]:
            failures.append({'negative': row, 'family': family, 'want': [codes[row]], 'errors': errors})
    corpus_totals, raws, ints = corpus_number_checks()
    long_checks = long_integer_checks()
    dispatch = dispatch_checks()
    rows = sorted({row for row, _b, _c, _fn in CHECKS})
    proved = sorted({row for row, _b, _f, _c, _n in negatives})
    summary = {
        'status': 'pass' if not failures else 'fail',
        'families': list(FAMILIES),
        'eager_refs': eager,
        'rows': len(rows),
        'rows_with_witness': len(proved),
        'rows_without_witness': sorted(set(rows) - set(proved)),
        'controls': control_checks,
        'negatives': negative_checks,
        'number_corpus': corpus_totals,
        'number_corpus_disagreements': 0,
        'raw_spellings': raws,
        'exact_integers': ints,
        'long_integer_checks': long_checks,
        'dispatch_checks': dispatch,
        'failures': failures[:50],
    }
    print(json.dumps(summary, indent=2))
    return 0 if not failures else 1


if __name__ == '__main__':
    sys.exit(main())


def export_fixtures(path):
    """Write the named controls and single-defect negatives as a data fixture
    artifact (no schema declarations; timestamp fields are data values)."""
    codes = {row: code for row, _b, code, _fn in CHECKS}
    items = []
    for cid, case in controls:
        items.append({'kind': 'control', 'case_id': cid, 'family': case['family'],
                      'boundary': cid.split(':')[0], 'value': case})
    for row, boundary, family, control_id, bad in negatives:
        items.append({'kind': 'negative', 'case_id': '%s:%s:%s' % (row, family, control_id),
                      'family': family, 'boundary': boundary, 'target_row': row,
                      'expected_code': codes[row], 'control': control_id, 'value': bad})
    doc = {'schema_id': 'pm.w3i.continuity_contract_fixtures.v1', 'fixture_only': True,
           'families': list(FAMILIES), 'items': items}
    Path(path).write_text(json.dumps(doc, indent=1, sort_keys=True) + '\n')
    return len(items)
