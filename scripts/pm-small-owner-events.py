#!/usr/bin/env python3
"""Static DM contract oracles. Synthetic checks; no native execution proof."""
import copy
import os
import sys
import hashlib
import json
import base64
import re
import importlib.util
from contextlib import contextmanager
from functools import lru_cache
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pm_event_numbers import (
    EVENT_VALUE, Refusal, current_integer, current_integer_token as _shared_integer_token,
    producer_semantic_bytes, producer_semantic_digest, storage_uint64, storage_value_bytes,
)
try:
    from blake3 import blake3
except ImportError:
    raise SystemExit('pm-small-owner-events requires the blake3 Python package for exact SP-337 byte oracles')
from datetime import datetime
from pathlib import Path
from referencing import Registry
from referencing.exceptions import Unresolvable
from referencing.jsonschema import DRAFT202012
from jsonschema import Draft202012Validator, FormatChecker, ValidationError, validators
FORMATS = FormatChecker()
@FORMATS.checks('date-time')
def utc_datetime(value):
    if not isinstance(value, str):
        return True
    if re.fullmatch(r'[0-9]{4}-[0-9]{2}-[0-9]{2}T(?:[01][0-9]|2[0-3]):[0-9]{2}:[0-9]{2}(?:\.[0-9]+)?Z', value) is None:
        return False
    try:
        parsed = datetime.fromisoformat(value.replace('Z', '+00:00'))
        return parsed.tzinfo is not None
    except ValueError:
        return False

ROOT = Path(__file__).resolve().parents[1]
INLINE_LIMIT = 16 * 1024
MAX_SAFE_JSON_INTEGER = 2**53 - 1
# Frozen retained-original recipe (SP-1101): the exact-decimal sorted-JSON
# producer digest in force when DM retained originals were written. Current
# writers use the shared CV-1100 producer route; this recipe is selected only
# for retained originals in resolve_original, never for current admission.
RETAINED_RECIPE_ID = 'dm-retained-producer-v1'


@contextmanager
def exact_integer_digits():
    """Render/parse integers exactly; a 4,400-digit integer must reach a
    refusal row, never crash the checker (CV-1100 sets no global cap)."""
    previous = sys.get_int_max_str_digits()
    sys.set_int_max_str_digits(0)
    try:
        yield
    finally:
        sys.set_int_max_str_digits(previous)


def integer_type(checker, instance):
    """The DM integer-only codec domain excludes Python's integral floats."""
    return type(instance) is int


DMValidator = validators.extend(
    Draft202012Validator,
    type_checker=Draft202012Validator.TYPE_CHECKER.redefine('integer', integer_type),
)


def integer_tree(value):
    if type(value) is float:
        return integer_type(None, value)
    if isinstance(value, dict):
        return all(integer_tree(v) for v in value.values())
    if isinstance(value, list):
        return all(integer_tree(v) for v in value)
    return True



def exact_value(value, expected):
    """Compare typed JSON facts; bool is never an integer observation.

    Integers share the instance validator callback, so its representation fence
    is identical in schemas and in independently observed copies. Retained u64
    values stay integers and never acquire the current producer range bound.
    """
    if integer_type(None, expected):
        if not integer_type(None, value):
            return False
    elif type(value) is not type(expected):
        return False
    if type(expected) is dict:
        return value.keys() == expected.keys() and all(exact_value(value[k], v) for k, v in expected.items())
    if type(expected) is list:
        return len(value) == len(expected) and all(exact_value(v, e) for v, e in zip(value, expected))
    return value == expected


def current_integer_token(token):
    # Shared CV-1100 integer-token grammar (refuses -0, leading zeroes, ...).
    with exact_integer_digits():
        return _shared_integer_token(token)


def current_float_token(token):
    raise ValueError('DM current input requires integer tokens')


def decode_current_json(text):
    """Current wire input only; retained JSON is decoded under its old recipe."""
    with exact_integer_digits():
        return json.loads(text, parse_int=current_integer_token, parse_float=current_float_token, parse_constant=current_float_token)


def canonical_json_numbers(value, *, retained=False):
    """Integral float aliases have identical bytes; nonintegral floats refuse.

    Current admission still refuses floats. This separate canonicalization
    prevents a hash caller from ever assigning 1.0 a different digest from 1.
    Storage's u64 metadata is outside producer semantics, not rounded to binary64.
    The current exact-range decision is the shared CV-1100 JCS qualification in
    current_producer_numbers/producer_digest, not a lane-local cap; the retained
    path keeps the frozen dm-retained-producer-v1 recipe with no current bound.
    """
    if type(value) is float:
        if not value.is_integer():
            raise ValueError('unsupported nonintegral JSON number')
        value = int(value)
    if isinstance(value, dict):
        return {k: canonical_json_numbers(v, retained=retained) for k, v in value.items()}
    if isinstance(value, list):
        return [canonical_json_numbers(v, retained=retained) for v in value]
    return value


def _current_integer_slots(value):
    """Shared CV-1100 current_integer at every integer leaf of the selection."""
    if type(value) is int:
        current_integer(value)
    elif isinstance(value, dict):
        for child in value.values():
            _current_integer_slots(child)
    elif isinstance(value, list):
        for child in value:
            _current_integer_slots(child)


def current_producer_numbers(event):
    selected = {k: event[k] for k in PRODUCER_FIELDS}
    if not integer_tree(selected):
        return False
    try:
        _current_integer_slots(selected)
        producer_semantic_bytes(canonical_json_numbers(selected))
    except ValueError:
        return False
    return True


def assert_schema_references(schema, registry=None):
    """Resolve even unused definitions, before any positive or negative data.

    A dangling reference is a broken contract, never an expected data refusal.
    jsonschema's resolver preserves JSON Pointer/anchor and nested-id semantics.
    """
    Draft202012Validator.check_schema(schema)
    validator = Draft202012Validator(schema, registry=registry if registry is not None else Registry())
    count = 0

    def walk(node, resolver):
        nonlocal count
        if isinstance(node, dict):
            resolver = resolver.in_subresource(DRAFT202012.create_resource(node))
            if '$ref' in node:
                try:
                    resolver.lookup(node['$ref'])
                except Unresolvable as error:
                    raise AssertionError(('unresolved schema reference', node['$ref'])) from error
                count += 1
            for child in node.values():
                walk(child, resolver)
        elif isinstance(node, list):
            for child in node:
                walk(child, resolver)

    walk(schema, validator._resolver)
    return count


def settings_companions_consistent(documents):
    """DL-408 changes current requirements; retained DRY history stays readable."""
    for document in documents.values():
        if any(name in json.dumps(document) for name in ('settings.updated', 'settings.theme.updated')):
            return False
    entries = documents['matrix']['entries']
    for key in ('catalog.theme_reset', 'catalog.theme_set_accent', 'catalog.theme_set_density', 'catalog.theme_set_mode'):
        entry = entries[key]
        if entry['expected_event_types'] != ['settings.layer.changed'] or entry['effect_contract']['receipt_or_event_refs'] != ['settings.layer.changed']:
            return False
    guard = next(p for p in documents['touch']['profiles'] if p['profile_id'] == 'TCP-DRY-METHOD')
    if guard['event_refs'] != [] or (guard['handler_status'], guard['wiring_status']) != ('absent', 'absent'):
        return False
    if 'owner_contract_missing' not in guard['disabled_reason_rule']:
        return False
    migration = ' '.join(guard['migration_refs'])
    if not all(token in migration for token in ('settings.agent_rules.dry_method_default_guard.updated', 'read-only', 'settings.layer.changed', 'owner-adoption', 'owner_contract_missing')):
        return False
    command = 'cmd.settings.agent_rules.dry_method_default_guard.set'
    if any(e['ui_command_id'] == command for e in entries.values()):
        return False
    exclusion = documents['exclusions']['notes'][command]
    return all(token in exclusion for token in ('settings.layer.changed', 'owner-adoption', 'owner_contract_missing', 'disabled'))


def run_settings_retirement(cases):
    documents = {key: json.loads((ROOT / path).read_text()) for key, path in (
        ('matrix', 'Plans/Wiring_Matrix.production.json'),
        ('touch', 'Plans/touch_closure.json'),
        ('exclusions', 'Plans/Wiring_Matrix.production.exclusions.json'),
    )}
    assert settings_companions_consistent(documents), 'DL-408 current Settings companions'
    for case in cases:
        bad = dict(documents)
        target = bad[case['document']] = copy.copy(documents[case['document']])
        for key in case['path'][:-1]:
            target[key] = copy.copy(target[key])
            target = target[key]
        target[case['path'][-1]] = case['value']
        assert not settings_companions_consistent(bad), case['case_id']
    return 1 + len(cases)


def digest(event, instance, payload):
    with exact_integer_digits():
        return hashlib.sha256(json.dumps([event, '1.0.0', instance, payload['project_id'], payload['operation_id']], ensure_ascii=False, separators=(',', ':')).encode()).hexdigest()


def semantic(payload, scope, event):
    if scope == 'project_only' and (type(payload['project_id']) is not str or not payload['project_id']):
        return False
    if 'after_revision' in payload and (not integer_type(None, payload['after_revision']) or not integer_type(None, payload['before_revision']) or payload['after_revision'] != payload['before_revision'] + 1):
        return False
    if event == 'lsp.server.lifecycle_changed' and payload['previous_state'] == payload['state']:
        return False
    return True


def read_allowed(current_token, selected_token, permission, source_present, withdrawn, version):
    return type(current_token) is str and type(selected_token) is str and exact_value(current_token, selected_token) and permission is True and source_present is True and withdrawn is False and version == '1.0.0'


def replay_decision(original_digest, retry_digest, original_receipt):
    if type(original_digest) is not str or type(retry_digest) is not str or type(original_receipt) is not str or original_digest != retry_digest:
        return ('identity_conflict_without_effect', None, 0)
    return ('return_original_without_effect', original_receipt, 0)


def producer_witness_allowed(event, witness):
    required = {
        'format.applied': {'execution_mode':'HTE','formatter_exit_code':0,'beyond_whitespace':True,'original_evidence_retained':True},
        'lsp.server.lifecycle_changed': {'supervisor_edge_proven':True,'host_root_join':True,'original_observation':True},
        'model.catalog_refreshed': {'revision_published':True,'provider_status_original':True,'stale_cache_is_success':False},
        'subagent.context_rehydrated': {'source_access_current':True,'source_history_preserved':True,'source_present':True,'child_identity_join':True},
        'subagent.context_shrunk': {'immune_block_touched':False,'protected_working_set_touched':False,'source_history_preserved':True,'shorter_effective_block':True,'child_identity_join':True},
        'project.added': {'atomic_registration_readback':True,'permission_and_handoffs_committed':True,'temporary_mount_only':False,'semantic_action':'existing_content'},
        'project.created': {'atomic_registration_readback':True,'permission_and_handoffs_committed':True,'remote_effect_unknown':False,'semantic_action':'new_creation'},
        'git.clone.completed': {'scm_backend':'git','terminal_result':'succeeded','destination_verified':True,'terminal_receipt_original':True,'reserved_lineage_join':True},
    }[event]
    return exact_value(witness, required)


# These bindings are independently fixed by each owner contract, never borrowed
# from another fixture row. All source adapters below are synthetic, NOT native.
FAMILY_BINDINGS = {
    'format.applied': ('timestamp', 'secret_refs_only', 'HTE formatter completion adapter'),
    'lsp.server.lifecycle_changed': ('ts', 'no_secrets', 'LspSupervisor lifecycle adapter'),
    'model.catalog_refreshed': ('completed_at_utc', 'secret_refs_only', 'shared model capability resolver refresh completion adapter'),
    'subagent.context_rehydrated': ('occurred_at_utc', 'secret_refs_only', 'effective-context runtime rehydration adapter'),
    'subagent.context_shrunk': ('occurred_at_utc', 'secret_refs_only', 'effective-context runtime shrinking adapter'),
    'project.added': ('completed_at_utc', 'secret_refs_only', 'Project registration commit adapter'),
    'project.created': ('completed_at_utc', 'secret_refs_only', 'Project creation composition terminal adapter'),
    'git.clone.completed': ('completed_at_utc', 'secret_refs_only', 'ordinary Git clone terminal adapter'),
}
PRODUCER_FIELDS = (
    'event_type', 'scope_kind', 'project_id', 'thread_id', 'run_id', 'node_id',
    'attempt_id', 'actor_ref', 'requested_account_ref', 'effective_account_ref',
    'occurred_at_utc', 'producer_sequence_id', 'correlation_id', 'causation_event_id',
    'parent_event_id', 'idempotency_key', 'payload_schema_id', 'payload', 'payload_ref',
    'redaction_profile', 'migration',
)
ORIGINAL_JOINS = (
    'scope_kind', 'project_id', 'thread_id', 'run_id', 'node_id', 'attempt_id',
    'actor_ref', 'requested_account_ref', 'effective_account_ref',
    'producer_sequence_id', 'correlation_id', 'causation_event_id', 'parent_event_id',
)
ADMISSION_GATES = (
    'membership', 'retention_resolved', 'schema_admitted', 'writer_enabled',
    'permission_current', 'dedupe_current', 'source_custody_available',
    'original_intent_available', 'original_result_available', 'owner_acceptance_current',
    'body_committed', 'lease_current', 'restore_controls_current',
    'same_restore_occurrence', 'protected_origin_current',
)
REBUILD_GATES = (
    'originals_present', 'source_current', 'coverage_complete', 'schema_supported',
    'current_frontier_verified', 'cas_matches',
    'reader_enabled', 'permission_current', 'source_present', 'deletion_clear',
    'hold_allows_disclosure',
)


def _dm_codec_domain(value):
    """DM's exact stored subset: nil/bool/integers/UTF-8/arrays/str-keyed maps."""
    if value is None or type(value) is bool or type(value) is int or type(value) is str:
        return
    if type(value) is list:
        for child in value:
            _dm_codec_domain(child)
        return
    if type(value) is dict and list([type(k) is str for k in value]).count(False) == 0:
        for child in value.values():
            _dm_codec_domain(child)
        return
    raise ValueError('unsupported fixture MessagePack type')


def canonical_fixture_msgpack(value):
    """SP-1100 EVENT_VALUE bytes over DM's exact subset (no float/binary).

    Refuse unsupported values instead of coercing them. The complete-value
    recipe is checked against canon's pre-existing golden preimage as well as
    every exact-family retained value; the shared codec is byte-identical on
    this subset.
    """
    _dm_codec_domain(value)
    try:
        return storage_value_bytes(value, profile=EVENT_VALUE)
    except Refusal as error:
        raise ValueError('fixture value outside codec range') from error


def full_value_preimage(event):
    return canonical_fixture_msgpack([
        'pm.storage.original_event_value_commitment.v1', '1.0.0',
        'pm.seglog_frame_v2.event_value.canonical_msgpack.v1',
        event['schema_id'], event['schema_version'], event,
    ])


def producer_digest(event):
    # Current CV-1100/CV-317 route: shared qualified JCS over the unchanged
    # full producer projection. Hash aliases canonically even when this
    # utility is called independently of writer admission.
    selected = canonical_json_numbers({k: event[k] for k in PRODUCER_FIELDS})
    return producer_semantic_digest(selected)


def retained_producer_digest(event):
    """Verify the frozen dm-retained-producer-v1 recipe (SP-1101).

    Historically valid values are integer-only, including retained u64
    producer sequences. Do not restamp their protected digests or bytes, and
    never apply the current writer's JCS qualification to a retained original.
    """
    selected = canonical_json_numbers({k: event[k] for k in PRODUCER_FIELDS}, retained=True)
    with exact_integer_digits():
        return hashlib.sha256(json.dumps(selected, sort_keys=True, ensure_ascii=False, separators=(',', ':'), allow_nan=False).encode()).hexdigest()


def scope_partition(event):
    if event['scope_kind'] == 'application':
        return 'app'
    return 'project~' + base64.urlsafe_b64encode(event['project_id'].encode()).decode().rstrip('=')


def application_key(server_id, operation_id):
    # CV-366: exact UTF-8 bytes, no hashing, trimming or normalization.
    return 'application@1:' + server_id.encode('utf-8').hex() + ':' + operation_id.encode('utf-8').hex()


def payload_descriptor(body):
    raw = canonical_fixture_msgpack(body)
    return {'blake3_id': blake3(raw).hexdigest(), 'byte_size': len(raw), 'media_type': 'application/msgpack'}


def payload_reference(descriptor):
    # EventRecord's existing payload_ref is a string. This family-owned binding
    # serializes the SP-337 descriptor; it changes no envelope field or codec.
    return json.dumps(descriptor, sort_keys=True, ensure_ascii=False, separators=(',', ':'))


def resolved_payload(event, schema, storage=None):
    body = event['payload']
    try:
        canonical_fixture_msgpack(body)
        if isinstance(storage, dict) and isinstance(storage.get('body'), dict):
            canonical_fixture_msgpack(storage['body'])
    except ValueError:
        return None
    if event['payload_ref'] is None:
        if len(canonical_fixture_msgpack(body)) > INLINE_LIMIT:
            return None
    else:
        if body != {} or not isinstance(storage, dict):
            return None
        if not all(storage.get(k) is True for k in (
            'pack_synced', 'index_synced', 'source_present', 'permission_current',
            'deletion_clear', 'hold_allows_disclosure',
        )):
            return None
        body = storage.get('body')
        if not isinstance(body, dict):
            return None
        descriptor = payload_descriptor(body)
        if descriptor['byte_size'] <= INLINE_LIMIT or not exact_value(storage.get('descriptor'), descriptor):
            return None
        if not integer_tree(storage['descriptor']):
            return None
        if event['payload_ref'] != payload_reference(descriptor):
            return None
    return body if DMValidator(schema, format_checker=FORMATS).is_valid(body) else None


def envelope_valid(event):
    envelope = json.loads((ROOT / 'Plans/event_record.schema.json').read_text())
    return DMValidator(envelope, format_checker=FORMATS).is_valid(event)


def custody_valid(custody):
    schema = json.loads((ROOT / 'Plans/event_append_receipt_contracts.schema.json').read_text())
    return DMValidator(dict(schema, **{'$ref': '#/$defs/custody_v2'}), format_checker=FORMATS).is_valid(custody)


def valid_event(row, event, original):
    payload_schema = json.loads((ROOT / row['schema']).read_text())
    if not envelope_valid(event):
        return False
    if not current_producer_numbers(event) or not integer_tree(original):
        return False
    payload = resolved_payload(event, payload_schema, original.get('payload_storage'))
    if payload is None:
        return False
    time_field, profile, owner = FAMILY_BINDINGS[row['event_type']]
    if original.get('owner') != owner or original.get('operation_id') != payload['operation_id']:
        return False
    if original.get('result_operation_id') != original['operation_id'] or not exact_value(original.get('result_payload'), payload):
        return False
    if not producer_witness_allowed(row['event_type'], original.get('producer_witness')):
        return False
    if not semantic(payload, row['scope_policy'], row['event_type']):
        return False
    if type(original.get('envelope_joins')) is not dict or set(original['envelope_joins']) != set(ORIGINAL_JOINS) or any(not exact_value(original['envelope_joins'][k], event[k]) for k in ORIGINAL_JOINS):
        return False
    if event['project_id'] != payload['project_id']:
        return False
    if event['occurred_at_utc'] != payload[time_field] or event['occurred_at_utc'] != original['completed_at_utc']:
        return False
    if event['event_type'] != row['event_type'] or event['payload_schema_id'] != payload_schema['$id']:
        return False
    if event['redaction_profile'] != profile or event['replay_policy'] != 'dedupe_by_idempotency_key':
        return False
    if type(original.get('storage_instance_id')) is not str:
        return False
    identity = digest(row['event_type'], original['storage_instance_id'], payload)
    key = row['event_type'] + ':' + identity
    if event['scope_kind'] == 'application':
        server_id = original.get('server_id')
        if not isinstance(server_id, str) or not server_id:
            return False
        key = application_key(server_id, original['operation_id'])
    if event['event_id'] != 'evt_' + identity or event['idempotency_key'] != key:
        return False
    if any(v is not None for v in event['migration'].values()):
        return False
    if row['event_type'].startswith('subagent.') and event['run_id'] != payload['run_id']:
        return False
    return True


def append_policy_refusal(event):
    return 'replay_only_not_appendable' if event.get('replay_policy') == 'projector_replay_only' else None


def delivery_types_valid(state):
    return type(state['receipt_delivery']) is bool and type(state['terminal_delivery']) is bool


def publication(row, state):
    """Fixture append adapter: no owner effects are invoked or undone."""
    outcome = {'durable_events': 0, 'receipt': None, 'terminal': False, 'owner_effects': 0}
    if not delivery_types_valid(state):
        return outcome
    if not integer_tree(state):
        return outcome
    if append_policy_refusal(state['event']) is not None:
        return outcome
    if not all(state[k] is True for k in ADMISSION_GATES):
        return outcome
    original = state['original_operation']
    if not all(integer_type(None, v) for v in (state['admission_epoch'], original['accepted_admission_epoch'], state['current_admission_epoch'])) or state['admission_epoch'] != original['accepted_admission_epoch'] or original['accepted_admission_epoch'] != state['current_admission_epoch']:
        return outcome
    if type(original['accepted_session_id']) is not str or type(original['restore_occurrence_id']) is not str or not exact_value(state['current_owner_session_id'], original['accepted_session_id']) or not exact_value(state['current_restore_occurrence_id'], original['restore_occurrence_id']):
        return outcome
    if not valid_event(row, state['event'], state['original_operation']):
        return outcome
    if state['frame_written'] is not True or state['group_synced'] is not True:
        return outcome
    # A durable group commit IS first issuance. A lagging custody row is rebuilt
    # from it; row presence is never an additional issuance phase.
    outcome['durable_events'] = 1
    if state['receipt_delivery']:
        # Issuance is protected by the committed original full-value authority.
        # A foreign/mutated delivery cannot publish success or undo its frame.
        replay = resolve_full_value(row, state['event'], state['committed_authority'])
        if replay is None or not exact_value(state['first_append_receipt'], replay[1]):
            return outcome
        outcome['receipt'] = copy.deepcopy(state['first_append_receipt'])
        outcome['terminal'] = state['terminal_delivery']
    return outcome


def resolve_original(row, incoming, authority):
    """Immutable semantic replay can outlive owner request/source handles."""
    if not custody_valid(authority['stored_custody']) or authority['protected_authority_current'] is not True:
        return None
    if not integer_tree(authority) or not integer_tree({k: incoming[k] for k in PRODUCER_FIELDS}):
        return None
    payload_schema = json.loads((ROOT / row['schema']).read_text())
    if not envelope_valid(authority['stored_event']):
        return None
    if resolved_payload(authority['stored_event'], payload_schema, authority.get('payload_storage')) is None:
        return None
    stored, receipt, result = authority['stored_event'], authority['stored_custody']['first_append_receipt'], authority['original_append_result']
    # Storage-assigned sequence identity is an exact SP-1100 uint64 at every join.
    try:
        storage_uint64(stored['sequence_id'])
        storage_uint64(receipt['sequence_id'])
        storage_uint64(result['sequence_id'])
    except (ValueError, KeyError, TypeError):
        return None
    custody = authority['stored_custody']
    expected_identity = (stored['event_id'], scope_partition(stored), stored['event_type'], stored['idempotency_key'], retained_producer_digest(stored))
    actual_identity = tuple(custody[k] for k in ['event_id', 'scope_partition', 'event_type', 'idempotency_key', 'producer_semantic_digest'])
    if expected_identity != actual_identity or custody['storage_instance_id'] != authority['storage_instance_id']:
        return None
    if incoming['event_id'] != stored['event_id'] or incoming['event_type'] != stored['event_type'] or incoming['idempotency_key'] != stored['idempotency_key'] or retained_producer_digest(incoming) != retained_producer_digest(stored):
        return None
    if not exact_value(result, {'event_id': stored['event_id'], 'sequence_id': stored['sequence_id'], 'segment_ref': custody['original_segment_ref'], 'byte_offset': receipt['byte_offset']}):
        return None
    if receipt['event_id'] != stored['event_id'] or receipt['sequence_id'] != stored['sequence_id']:
        return None
    if not exact_value(authority['first_append_receipt'], receipt):
        return None
    return copy.deepcopy((result, receipt))


def resolve_full_value(row, requested, authority):
    if not integer_tree(requested):
        return None
    replay = resolve_original(row, requested, authority)
    if replay is None:
        return None
    commitment = authority['stored_custody']['original_event_value_commitment']
    try:
        requested_preimage = full_value_preimage(requested)
        stored_preimage = full_value_preimage(authority['stored_event'])
    except ValueError:
        return None
    if commitment['sha256'] != hashlib.sha256(requested_preimage).hexdigest() or commitment['sha256'] != hashlib.sha256(stored_preimage).hexdigest():
        return None
    return replay


def current_retry(row, incoming, authority):
    """Current writer policy admission precedes immutable semantic resolution."""
    # Closure belongs to the current request, independently of semantic hashing
    # and the protected stored envelope. Storage metadata stays outside the hash.
    envelope = json.loads((ROOT / 'Plans/event_record.schema.json').read_text())
    if incoming.keys() - envelope['properties'].keys():
        return ('identity_conflict_without_effect', None, 0)
    # Dispatch the current request before resolving its retained original.
    # These envelope markers are not producer semantics or Storage metadata.
    if incoming.get('schema_id') != 'pm.event.v0':
        return ('identity_conflict_without_effect', None, 0)
    if incoming.get('schema_version') != '2.0.0':
        return ('identity_conflict_without_effect', None, 0)
    if append_policy_refusal(incoming) is not None:
        return (append_policy_refusal(incoming), None, 0)
    if incoming.get('replay_policy') != 'dedupe_by_idempotency_key':
        return ('identity_conflict_without_effect', None, 0)
    if incoming.get('event_type') != row['event_type']:
        return ('identity_conflict_without_effect', None, 0)
    expected_schema = json.loads((ROOT / row['schema']).read_text())['$id']
    if incoming.get('payload_schema_id') != expected_schema:
        return ('identity_conflict_without_effect', None, 0)
    # Retry resolves an already issued original under its protected recipe;
    # the current append encoder's exact-integer range cannot retire history.
    if not integer_tree({k: incoming[k] for k in PRODUCER_FIELDS}):
        return ('identity_conflict_without_effect', None, 0)
    result = resolve_original(row, incoming, authority)
    return ('return_original_without_effect', result, 0) if result is not None else ('identity_conflict_without_effect', None, 0)


@lru_cache(maxsize=2)
def read_token_validator(durable):
    schema = json.loads((ROOT / 'Plans/event_record_index_checkpoint.schema.json').read_text())['$defs']['read_token']
    if durable:
        schema['required'].remove('redb_snapshot_id')
        del schema['properties']['redb_snapshot_id']
    # Python's ordinary ^...$ pattern check accepts a trailing LF. Preserve the
    # shared schema and enforce exact identifier matches in this adapter.
    def full_pattern(validator, pattern, instance, subschema):
        if isinstance(instance, str) and re.fullmatch(pattern, instance) is None:
            yield ValidationError('read-token identifier does not fully match')
    strict = validators.extend(DMValidator, {'pattern': full_pattern})
    return strict(schema, format_checker=FORMATS)


def token_matches_original(token, original, durable=False):
    if not read_token_validator(durable).is_valid(token):
        return False
    def single_line(value):
        if isinstance(value, str):
            return '\r' not in value and '\n' not in value
        if isinstance(value, dict):
            return all(single_line(v) for v in value.values())
        return True
    if not single_line(token):
        return False
    storage = original['storage_instance_id']
    return (
        token['storage_instance_id'] == storage
        and token['source_selection']['storage_instance_id'] == storage
        and token['checkpoint_key'] == 'event_record_index_checkpoint.v1:' + storage
        and token['index_dataset_name'] == 'event_record_index.v2@' + token['generation_id']
    )


def checkpoint_matches_original(state):
    checkpoint = state.get('new_checkpoint', {})
    if not integer_tree(checkpoint):
        return False
    token = checkpoint.get('durable_read_token')
    selected = state.get('selected_live_token')
    original = state['retained_authority']
    if not token_matches_original(token, original, durable=True) or not token_matches_original(selected, original):
        return False
    return (
        exact_value(token, {k: v for k, v in selected.items() if k != 'redb_snapshot_id'})
        and exact_value(checkpoint.get('frontier_revision'), token['frontier_revision'])
    )


def retained_event_valid(row, event, authority, selected):
    """Read Storage's protected original, without replaying live owner admission.

    The selected source observation is from Storage, not the supplied payload.
    Full-value resolution authenticates Storage-assigned metadata as well as
    producer bytes. Compatibility replay-only history never becomes appendable.
    """
    if not envelope_valid(event):
        return False
    schema = json.loads((ROOT / row['schema']).read_text())
    return (
        event['event_type'] == row['event_type']
        and event['payload_schema_id'] == schema['$id']
        and exact_value(authority['source_selection'], selected['source_selection'])
        and resolve_full_value(row, event, authority) is not None
    )


def reader_result(row, state):
    return 'available' if (
        integer_tree({k: state[k] for k in ('event', 'retained_authority', 'live_token', 'selected_token')})
        and state['reader_enabled'] is True and state['permission_current'] is True and state['source_present'] is True
        and state['deletion_clear'] is True and state['hold_allows_disclosure'] is True
        and state['version'] == '1.0.0' and state['current_frontier_verified'] is True
        and token_matches_original(state['live_token'], state['retained_authority'])
        and exact_value(state['selected_token'], state['live_token'])
        and retained_event_valid(row, state['event'], state['retained_authority'], state['live_token'])
    ) else 'unavailable'


def rebuild_publication(row, state):
    old = copy.deepcopy(state['old_publication'])
    if not integer_tree({k: state[k] for k in ('event', 'retained_authority', 'new_checkpoint', 'selected_live_token')}):
        return old
    if not all(state[k] is True for k in REBUILD_GATES):
        return old
    if state['version'] != '1.0.0' or not retained_event_valid(row, state['event'], state['retained_authority'], state['selected_live_token']):
        return old
    if not checkpoint_matches_original(state):
        return old
    # One transaction publishes rows and checkpoint. No family-specific cursor.
    return {'rows': [copy.deepcopy(state['event'])], 'checkpoint': copy.deepcopy(state['new_checkpoint'])}


def patched(value, patches):
    result = copy.deepcopy(value)
    for patch in patches:
        target = result
        for key in patch['path'][:-1]:
            target = target[key]
        if patch.get('delete'):
            del target[patch['path'][-1]]
        else:
            target[patch['path'][-1]] = copy.deepcopy(patch['value'])
    return result


def boundary_state(row, case):
    """Materialize the exact authored synthetic body; never native authority."""
    body = copy.deepcopy(row['positive_payload'])
    body[case['array_field']] = [
        'ref:' + f'{i:03d}' + ':' + 'x' * (length - 8)
        for i, length in enumerate(case['ref_lengths'])
    ]
    assert len(canonical_fixture_msgpack(body)) == case['body_bytes']
    state = copy.deepcopy(row['publication_positive'])
    state['original_operation']['result_payload'] = copy.deepcopy(body)
    if case['mode'] == 'inline':
        state['event']['payload'] = body
    else:
        descriptor = payload_descriptor(body)
        storage = dict(body=body, descriptor=copy.deepcopy(descriptor), **{k: True for k in (
            'pack_synced', 'index_synced', 'source_present', 'permission_current',
            'deletion_clear', 'hold_allows_disclosure',
        )})
        state['event']['payload'] = {}
        state['event']['payload_ref'] = payload_reference(descriptor)
        state['original_operation']['payload_storage'] = storage
    # Synthetic original append custody for this prospective accepted result.
    authority = state['committed_authority']
    authority['stored_event'] = copy.deepcopy(state['event'])
    if case['mode'] != 'inline':
        authority['payload_storage'] = copy.deepcopy(storage)
    custody = authority['stored_custody']
    custody['producer_semantic_digest'] = producer_digest(state['event'])
    custody['original_event_value_commitment']['sha256'] = hashlib.sha256(full_value_preimage(state['event'])).hexdigest()
    return patched(state, case.get('patches', []))


def upstream_sequence_state(row, sequence):
    """A coherent synthetic original, before changing only the incoming value."""
    state = copy.deepcopy(row['publication_positive'])
    state['event']['producer_sequence_id'] = sequence
    state['original_operation']['envelope_joins']['producer_sequence_id'] = sequence
    authority = state['committed_authority']
    authority['stored_event'] = copy.deepcopy(state['event'])
    authority['source_selection'] = copy.deepcopy(row['reader_positive']['retained_authority']['source_selection'])
    authority['stored_custody']['producer_semantic_digest'] = retained_producer_digest(state['event'])
    authority['stored_custody']['original_event_value_commitment']['sha256'] = hashlib.sha256(full_value_preimage(state['event'])).hexdigest()
    return state


def numeric_paths(value, path=()):
    """All numeric leaves in the lane's actual states, excluding Boolean flags."""
    if type(value) is int:
        yield path, value
    elif isinstance(value, dict):
        for key, child in value.items():
            yield from numeric_paths(child, path + (key,))
    elif isinstance(value, list):
        for key, child in enumerate(value):
            yield from numeric_paths(child, path + (key,))


def run_numeric_family(row):
    count = 0
    def check(condition, label):
        nonlocal count
        assert condition, (row['event_type'], 'numeric', label)
        count += 1

    cases = row['numeric_representation_cases']
    for token in cases['current_json_negatives']:
        try:
            decode_current_json(token)
        except ValueError:
            check(True, 'raw current refusal ' + token)
        else:
            check(False, 'raw current refusal ' + token)
    for number in cases['retained_upstream_integers']:
        state = upstream_sequence_state(row, number)
        event, authority = state['event'], state['committed_authority']
        expected = (authority['original_append_result'], authority['first_append_receipt'])
        before = copy.deepcopy(state)
        safe = number <= MAX_SAFE_JSON_INTEGER
        check(valid_event(row, event, state['original_operation']) == safe, 'integer writer ' + str(number))
        check(publication(row, state)['terminal'] == safe, 'integer publication ' + str(number))
        check(current_retry(row, event, authority)[0] == 'return_original_without_effect', 'original integer retry ' + str(number))
        check(resolve_full_value(row, event, authority) == expected, 'original retained integer recipe ' + str(number))
        for mode in ('reader', 'rebuild'):
            historical = copy.deepcopy(row[mode + '_positive'])
            historical.pop('original_operation', None)
            historical['event'] = copy.deepcopy(event)
            historical['retained_authority'] = copy.deepcopy(authority)
            historical['current_live_owner_state'] = {'writer_enabled': False, 'revision': 999.0}
            historical['obsolete_request'] = {'timeout_seconds': 1.5}
            if mode == 'reader':
                check(reader_result(row, historical) == 'available', 'historical reader ' + str(number))
            else:
                historical['old_publication']['unrelated_numeric_value'] = 1.5
                check(rebuild_publication(row, historical) != historical['old_publication'], 'historical rebuild ' + str(number))
        check(state == before, 'immutable integer authority ' + str(number))
    for token in cases['upstream_aliases']:
        alias = json.loads(token)
        check(type(alias) is float and alias.is_integer(), 'integral float stimulus ' + token)
        if abs(alias) > MAX_SAFE_JSON_INTEGER:
            # A current append cannot supply a valid baseline outside its
            # encoder domain. Isolate representation at the schema boundary,
            # whose integer domain includes this exact mathematical value.
            baseline = dict(row['positive_event_record'], producer_sequence_id=int(alias))
            check(envelope_valid(baseline), 'schema integer baseline ' + token)
            check(not envelope_valid(dict(baseline, producer_sequence_id=alias)), 'schema-only alias refusal ' + token)
            continue
        state = upstream_sequence_state(row, int(alias))
        event, authority = state['event'], state['committed_authority']
        incoming = dict(event, producer_sequence_id=alias)
        before = copy.deepcopy((state, incoming))
        check(not envelope_valid(incoming), 'schema representation refusal ' + token)
        check(not valid_event(row, incoming, state['original_operation']), 'writer representation refusal ' + token)
        lost_ack = dict(state, event=incoming, receipt_delivery=False, terminal_delivery=False)
        check(publication(row, lost_ack)['durable_events'] == 0, 'no durable aliased append ' + token)
        check(current_retry(row, incoming, authority) == ('identity_conflict_without_effect', None, 0), 'retry representation refusal ' + token)
        check(resolve_full_value(row, incoming, authority) is None, 'retained alias cannot forge original ' + token)
        if abs(alias) <= MAX_SAFE_JSON_INTEGER:
            check(producer_digest(incoming) == producer_digest(event), 'one RFC 8785 digest ' + token)
        else:
            try:
                producer_digest(incoming)
            except ValueError:
                check(True, 'out of exact hash domain ' + token)
            else:
                check(False, 'out of exact hash domain ' + token)
        check((state, incoming) == before, 'immutable alias inputs ' + token)
    # Historical JSON -0 already decoded to integer zero; never rewrite history.
    zero = upstream_sequence_state(row, 0)
    negative_zero = dict(zero['event'], producer_sequence_id=json.loads('-0'))
    check(producer_digest(negative_zero) == producer_digest(zero['event']), 'parsed -0 one semantic hash')
    check(full_value_preimage(negative_zero) == full_value_preimage(zero['event']), 'parsed -0 one original byte string')
    for name in ('publication_positive', 'reader_positive', 'rebuild_positive'):
        original = row[name]
        for path, value in numeric_paths(original):
            if name == 'rebuild_positive' and path[0] == 'old_publication':
                continue  # opaque fallback, not the proposed retained identity
            bad = patched(original, [{'path': list(path), 'value': float(value)}])
            before = copy.deepcopy(bad)
            if name == 'publication_positive':
                check(publication(row, bad)['durable_events'] == 0, 'publication numeric ' + repr(path))
            elif name == 'reader_positive':
                check(reader_result(row, bad) == 'unavailable', 'reader numeric ' + repr(path))
            else:
                check(rebuild_publication(row, bad) == bad['old_publication'], 'rebuild numeric ' + repr(path))
            check(bad == before, 'immutable numeric ' + name + repr(path))
    return count


def run_exact_family(row):
    count = 0
    def check(condition, label):
        nonlocal count
        assert condition, (row['event_type'], label)
        count += 1

    event, original = row['positive_event_record'], row['original_operation']
    required = set(json.loads((ROOT / 'Plans/event_record.schema.json').read_text())['required'])
    check(required == {c['field'] for c in row['envelope_negatives'] if c.get('delete')}, 'complete envelope deletion matrix')
    check(set(ADMISSION_GATES) <= {c['case_id'].removeprefix('cut_') for c in row['admission_cases']}, 'complete admission cut matrix')
    check(set(PRODUCER_FIELDS) == {c['field'] for c in row['semantic_mutations']}, 'complete semantic conflict matrix')
    check({'pre_effect', 'pending', 'effect_complete', 'prepared_before_append'} <= {c.get('intent_stage') for c in row['withdrawal_cases']}, 'complete original-intent withdrawal stages')
    check(valid_event(row, event, original), 'full original-operation EventRecord')
    for case in row['envelope_negatives']:
        bad = copy.deepcopy(event)
        if case.get('delete'):
            del bad[case['field']]
        else:
            bad[case['field']] = case['value']
        check(not valid_event(row, bad, original), case['case_id'])
    for case in row['original_operation_negatives']:
        bad = copy.deepcopy(original)
        if case.get('delete'):
            del bad[case['field']]
        else:
            bad[case['field']] = case['value']
        check(not valid_event(row, event, bad), case['case_id'])
    # Every producer-semantic field is frozen, including nulls and payload.
    for case in row['semantic_mutations']:
        bad = copy.deepcopy(event)
        bad[case['field']] = case['value']
        check(producer_digest(bad) != producer_digest(event), case['case_id'])
        check(resolve_original(row, bad, row['receipt_authority']) is None, case['case_id'] + ': no reissue')

    for variant in row['scope_variants']:
        check(valid_event(row, variant['event'], variant['original_operation']), 'independent scope/original variant')
    project_event = next((v['event'] for v in row['scope_variants'] if v['event']['scope_kind'] == 'project'), event)
    partition_case = row['project_partition_case']
    check(partition_case['encoded_partition'] == scope_partition(project_event), 'authored encoded project partition positive')
    check(partition_case['raw_project_id'] == project_event['project_id'] and partition_case['raw_project_id'] != scope_partition(project_event), 'raw project id is not a partition')
    # Five closed bounded bodies cannot legally reach 16 KiB. Still isolate
    # Storage's byte gate with an oversized synthetic object, independent of
    # its inevitable closed-schema refusal. This never widens a writer schema.
    oversized = copy.deepcopy(event)
    oversized['payload'][row['oversized_inline_probe']['field']] = 'x' * row['oversized_inline_probe']['padding_bytes']
    check(len(canonical_fixture_msgpack(oversized['payload'])) > INLINE_LIMIT, 'authored oversized inline probe exceeds cap')
    check(resolved_payload(oversized, {'type': 'object'}) is None, 'oversized inline bytes refused before logical schema')
    check(any(c.get('value') == 'projector_replay_only' and c.get('field') == 'replay_policy' for c in row['envelope_negatives']), 'authored replay-only append negative')
    historical = row['historical_reader_only']
    historical_event = historical['stored_event']
    check(append_policy_refusal(historical_event) == 'replay_only_not_appendable', 'append replay-only exact refusal')
    check(resolve_full_value(row, historical_event, historical) == (historical['original_append_result'], historical['first_append_receipt']), 'immutable historical replay-only read preserved')
    check(current_retry(row, historical_event, historical) == ('replay_only_not_appendable', None, 0), 'even genuine historical replay-only original cannot become a current retry')
    if event['scope_kind'] == 'project':
        check(row['receipt_authority']['stored_custody']['scope_partition'] == scope_partition(event), 'encoded project partition')
    if event['scope_kind'] == 'application':
        check(event['idempotency_key'] == application_key(original['server_id'], original['operation_id']), 'CV-366 exact key')
    for case in row['writer_retry_cases']:
        incoming = copy.deepcopy(event)
        incoming.update(copy.deepcopy(case['event_overrides']))
        decision, result, effects = current_retry(row, incoming, row['receipt_authority'])
        check(decision == case['expected'] and effects == 0, case['case_id'])
        check((result is not None) == (case['expected'] == 'return_original_without_effect'), case['case_id'] + ': original receipt only')
        if result is not None:
            check(result == (row['receipt_authority']['original_append_result'], row['receipt_authority']['first_append_receipt']), case['case_id'] + ': Storage original metadata only')
    check(any(c['event_overrides'].get('replay_policy') == 'projector_replay_only' for c in row['writer_retry_cases']), 'authored replay-only retry negative')
    for case in row['publication_receipt_cases']:
        state = patched(row['publication_positive'], case['patches'])
        before = copy.deepcopy(state)
        check(publication(row, state) == case['expected'], case['case_id'])
        check(state == before, case['case_id'] + ': immutable publication authority')
    check(set(event_receipt_fields(row)) <= {c.get('field') for c in row['publication_receipt_cases']}, 'all receipt publication joins covered')
    for case in row['payload_boundary_cases']:
        state = boundary_state(row, case)
        check(valid_event(row, state['event'], state['original_operation']) == case['valid'], case['case_id'] + ': body admission')
        actual = publication(row, state)
        check(actual['durable_events'] == int(case['valid']) and actual['terminal'] == case['valid'], case['case_id'] + ': publication')
        if case['valid']:
            authority = state['committed_authority']
            check(resolve_full_value(row, state['event'], authority) == (authority['original_append_result'], authority['first_append_receipt']), case['case_id'] + ': full original value')
            damaged = copy.deepcopy(authority)
            if 'payload_storage' in damaged:
                damaged['payload_storage']['source_present'] = False
                check(resolve_full_value(row, state['event'], damaged) is None, case['case_id'] + ': missing external source unavailable')
    for case in row['pattern_negatives']:
        schema = json.loads((ROOT / row['schema']).read_text())
        check(not DMValidator(schema, format_checker=FORMATS).is_valid(patched(row['positive_payload'], case['patches'])), case['case_id'])
    schema = json.loads((ROOT / row['schema']).read_text())
    def patterns(node):
        if isinstance(node, dict):
            if 'pattern' in node and node['pattern'].startswith('^'):
                check(node['pattern'].endswith('(?![\\s\\S])') or node.get('minLength') == node.get('maxLength') is not None, 'every anchored identifier pattern has full-match guard or exact length')
            for child in node.values():
                patterns(child)
        elif isinstance(node, list):
            for child in node:
                patterns(child)
    patterns(schema)
    for case in row['admission_cases']:
        state = copy.deepcopy(row['publication_positive'])
        state.update(copy.deepcopy(case['overrides']))
        before = copy.deepcopy(state)
        actual = publication(row, state)
        check(actual == case['expected'], case['case_id'])
        check(state == before, case['case_id'] + ': no source rewriting')
    # Actual branch admission remains absent. Fixture positives are hypothetical.
    registry = json.loads((ROOT / 'Plans/event_family_registry.json').read_text())
    check(not any(f['event_type'] == row['event_type'] for f in registry['families']), 'prepared without membership')

    authority = row['receipt_authority']
    before = copy.deepcopy(authority)
    for case in row['receipt_cases']:
        candidate = copy.deepcopy(authority)
        candidate.update(copy.deepcopy(case.get('authority_overrides', {})))
        candidate = patched(candidate, case.get('authority_patches', []))
        incoming = copy.deepcopy(event)
        incoming.update(copy.deepcopy(case.get('event_overrides', {})))
        original_result = resolve_full_value(row, incoming, candidate)
        expected = (authority['original_append_result'], authority['first_append_receipt']) if case['expected'] == 'return_original' else None
        check(original_result == expected, case['case_id'])
        check(authority == before, case['case_id'] + ': immutable receipt')
    # Storage-assigned changes leave semantic replay alone but fail full-value.
    for field in ['sequence_id', 'observed_at_utc', 'persisted_at_utc']:
        incoming = copy.deepcopy(event)
        incoming[field] = incoming[field] + 1 if field == 'sequence_id' else '2026-11-04T12:01:00Z'
        check(producer_digest(incoming) == producer_digest(event), field + ': excluded from semantic digest')
        check(resolve_original(row, incoming, authority) is not None, field + ': semantic replay')
        check(resolve_full_value(row, incoming, authority) is None, field + ': complete value refusal')

    for case in row['reader_cases']:
        state = copy.deepcopy(row['reader_positive'])
        state.update(copy.deepcopy(case['overrides']))
        state = patched(state, case.get('patches', []))
        check(reader_result(row, state) == case['expected'], case['case_id'])
    for case in row['rebuild_cases']:
        state = copy.deepcopy(row['rebuild_positive'])
        state.update(copy.deepcopy(case['overrides']))
        state = patched(state, case.get('patches', []))
        before = copy.deepcopy(state)
        result = rebuild_publication(row, state)
        expected = state['old_publication'] if case['expected'] == 'preserve_old' else {'rows': [state['event']], 'checkpoint': state['new_checkpoint']}
        check(result == expected, case['case_id'])
        check(state == before, case['case_id'] + ': no domain effects')
    checkpoint_cases = {c['case_id'] for c in row['rebuild_cases'] if c['expected'] == 'preserve_old'}
    check({
        'checkpoint_foreign_storage_instance', 'checkpoint_foreign_source_storage',
        'checkpoint_foreign_key', 'checkpoint_foreign_storage_coherent',
        'checkpoint_unselected_frontier', 'checkpoint_persisted_snapshot',
        'checkpoint_trailing_LF_generation', 'checkpoint_missing_token',
    } <= checkpoint_cases, 'authored checkpoint identity refusal matrix')
    live = row['reader_positive']['live_token']
    token_schema = json.loads((ROOT / 'Plans/event_record_index_checkpoint.schema.json').read_text())
    check(DMValidator(dict(token_schema, **{'$ref': '#/$defs/read_token'}), format_checker=FORMATS).is_valid(live), 'ten-field live read token')
    durable = row['durable_read_token']
    check(durable == {k: v for k, v in live.items() if k != 'redb_snapshot_id'} and len(durable) == 9, 'nine-field durable token')
    check('redb_snapshot_id' not in durable, 'no persisted snapshot identity')
    for case in row['withdrawal_cases']:
        if case['role'] == 'writer':
            state = copy.deepcopy(row['publication_positive'])
            state.update(case['overrides'])
            result = publication(row, state)
            check(result['durable_events'] == case['expected_durable_events'] and result['owner_effects'] == 0, case['case_id'])
            if result['receipt'] is not None:
                check(result['receipt']['event_id'] == state['event']['event_id'], case['case_id'] + ': fresh receipt joins original')
        elif case['role'] == 'issued_replay':
            # No current owner-intent source is supplied on immutable replay.
            check(resolve_full_value(row, event, authority) == (authority['original_append_result'], authority['first_append_receipt']), case['case_id'])
        elif case['role'] == 'reader':
            state = copy.deepcopy(row['reader_positive'])
            state.update(case['overrides'])
            check(reader_result(row, state) == case['expected'], case['case_id'])
        elif case['role'] == 'reenable':
            rebuild = copy.deepcopy(row['rebuild_positive'])
            rebuild['current_frontier_verified'] = case['rebuild_current']
            rebuild['source_current'] = case['source_current']
            rebuilt = rebuild_publication(row, rebuild)
            ready = case['governed_admission'] and rebuilt != rebuild['old_publication']
            check(ready == case['expected'], case['case_id'])
        elif case['role'] == 'global_index':
            state = copy.deepcopy(row['rebuild_positive'])
            check(rebuild_publication(row, state) != state['old_publication'], case['case_id'])
        else:
            raise AssertionError(('unknown withdrawal role', case))
    # A profile or binding regression in ANY of the three owner copies fails.
    for owner in row['owner_units']:
        text = (ROOT / owner['path']).read_text().split('plan_unit_id: ' + owner['unit'] + '\n', 1)[1].split('\ngui_related:', 1)[0]
        time_field, profile, _ = FAMILY_BINDINGS[row['event_type']]
        check('redaction_profile=' + profile in text and 'redacted_refs_only' not in text.replace('profile (including redacted_refs_only)', ''), 'owner profile ' + owner['unit'])
        check('occurred_at_utc equals payload.' + time_field in text and 'correlation_id is the non-empty' in text and 'actor_ref is the non-empty' in text, 'owner joins ' + owner['unit'])
        check('replay_only_not_appendable' in text and '16 KiB' in text and 'publication' in text, 'standing owner checks ' + owner['unit'])
        check('Checkpoint identity for ' + row['event_type'] in text and 'selected live token' in text, 'owner checkpoint identity ' + owner['unit'])
    return count


def event_receipt_fields(row):
    return row['publication_positive']['first_append_receipt'].keys()



def families_for_run(fixtures):
    """Keep each VM checker/audit run to one family when requested."""
    family = os.environ.get('PM_DM_FAMILY')
    rows = [r for r in fixtures['families'] if family is None or r['event_type'] == family]
    assert rows, ('unknown DM family', family)
    return rows


def timestamp_state(row, value, field='occurred_at_utc'):
    """One time fact with its owner/result/Storage observation copies coherent."""
    state = copy.deepcopy(row['publication_positive'])
    event, original = state['event'], state['original_operation']
    event[field] = value
    if field == 'occurred_at_utc':
        time_field = FAMILY_BINDINGS[row['event_type']][0]
        event['payload'][time_field] = value
        original['completed_at_utc'] = value
        original['result_payload'][time_field] = value
    authority = state['committed_authority']
    authority['stored_event'] = copy.deepcopy(event)
    authority['stored_custody']['producer_semantic_digest'] = retained_producer_digest(event)
    authority['stored_custody']['original_event_value_commitment']['sha256'] = hashlib.sha256(full_value_preimage(event)).hexdigest()
    return state


def main(guard_first=None):
    fixtures = json.loads((ROOT / 'Plans/small_owner_event_fixtures.json').read_text())
    assert len(fixtures['families']) == len(FAMILY_BINDINGS) and {r['event_type'] for r in fixtures['families']} == set(FAMILY_BINDINGS)
    spec = importlib.util.spec_from_file_location('dm_guard_oracles', ROOT / 'scripts/pm-small-owner-guard-audit.py')
    guard_oracles = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(guard_oracles)
    isolation_count = guard_oracles.normal_checks(globals(), fixtures, guard_first)
    families = {row['event_type']: row for row in fixtures['families']}
    retry_boundary_count = 0
    for row in families_for_run(fixtures):
        original = row['positive_event_record']
        authority = row['receipt_authority']
        envelope = json.loads((ROOT / 'Plans/event_record.schema.json').read_text())
        for case in row['retry_extra_field_cases']:
            incoming = dict(original, **{case['field']: case['value']})
            before = copy.deepcopy((original, authority))
            assert case['field'] not in original, case['case_id']
            assert incoming.keys() - original.keys() == {case['field']} and all(exact_value(incoming[k], original[k]) for k in original), case['case_id']
            errors = list(DMValidator(envelope, format_checker=FORMATS).iter_errors(incoming))
            assert len(errors) == 1 and errors[0].validator == 'additionalProperties' and not errors[0].path, case['case_id']
            assert producer_digest(incoming) == producer_digest(original), case['case_id']
            assert not valid_event(row, incoming, row['original_operation']), case['case_id']
            assert current_retry(row, incoming, authority) == (case['expected'], None, 0), case['case_id']
            assert exact_value((original, authority), before), (case['case_id'], 'authentic original unchanged')
            retry_boundary_count += 7
        for case in row['retry_envelope_cases']:
            incoming = dict(original, **{case['field']: case['value']})
            before = copy.deepcopy((original, authority))
            assert [k for k in original if incoming[k] != original[k]] == [case['field']], case['case_id']
            assert producer_digest(incoming) == producer_digest(original), case['case_id']
            assert current_retry(row, incoming, authority) == (case['expected'], None, 0), case['case_id']
            assert (original, authority) == before, (case['case_id'], 'authentic original unchanged')
            retry_boundary_count += 4
        for case in row.get('foreign_family_retry_cases', []):
            if case['foreign_event'] and case['foreign_authority']:
                assert case['test_class'] == 'integration_regression' and case['check_11_credit'] is False, case['case_id']
                retry_boundary_count += 1
            foreign = families[case['source_family']]
            assert foreign is not row, case['case_id']
            event = foreign['positive_event_record'] if case['foreign_event'] else row['positive_event_record']
            authority = foreign['receipt_authority'] if case['foreign_authority'] else row['receipt_authority']
            before = copy.deepcopy((event, authority))
            assert current_retry(row, event, authority) == ('identity_conflict_without_effect', None, 0), case['case_id']
            assert (event, authority) == before, (case['case_id'], 'immutable original inputs')
            retry_boundary_count += 3
    reference_count = 0
    schema_paths = {r['schema'] for r in fixtures['families']} | {
        'Plans/event_record.schema.json', 'Plans/event_record_index_checkpoint.schema.json',
        'Plans/event_append_receipt_contracts.schema.json',
    }
    schemas = {path: json.loads((ROOT / path).read_text()) for path in sorted(schema_paths)}
    registry = Registry().with_resources((schema['$id'], DRAFT202012.create_resource(schema)) for schema in schemas.values())
    for schema in schemas.values():
        reference_count += assert_schema_references(schema, registry)
    settings_count = run_settings_retirement(fixtures['settings_retirement_cases'])
    golden = json.loads((ROOT / 'Plans/event_append_receipt_full_value_fixtures.json').read_text())
    assert full_value_preimage(golden['base_original_event']).hex() == golden['commitment_preimage_hex']
    assert hashlib.sha256(full_value_preimage(golden['base_original_event'])).hexdigest() == golden['commitment_sha256']
    count = 2 + len(schema_paths) + reference_count + settings_count + isolation_count + retry_boundary_count
    for row in families_for_run(fixtures):
        event = row['event_type']
        schema = json.loads((ROOT / row['schema']).read_text())
        Draft202012Validator.check_schema(schema)
        # Even an unused dangling definition must be caught for this family.
        bad_schema = copy.deepcopy(schema)
        bad_schema.setdefault('$defs', {})['unused_reference_negative'] = {'$ref': row['unresolved_reference_negative']}
        try:
            assert_schema_references(bad_schema, registry)
        except AssertionError as error:
            assert error.args[0] == ('unresolved schema reference', row['unresolved_reference_negative'])
        else:
            raise AssertionError((event, 'unresolved schema reference accepted'))
        count += 1
        validator = DMValidator(schema, format_checker=FORMATS)
        payload = row['positive_payload']
        assert validator.is_valid(payload), (event, list(validator.iter_errors(payload)))
        assert semantic(payload, row['scope_policy'], event)
        count += 2
        # Every required field and every root extension has an explicit negative.
        for key in schema['required']:
            bad = copy.deepcopy(payload)
            del bad[key]
            assert not validator.is_valid(bad), (event, key)
            count += 1
        bad = dict(payload, unexpected='secret')
        assert not validator.is_valid(bad)
        bad = dict(payload, schema_version='9.0.0')
        assert not validator.is_valid(bad)
        count += 2
        for key in ['timestamp', 'ts', 'completed_at_utc', 'occurred_at_utc']:
            if key in payload:
                assert not validator.is_valid(dict(payload, **{key: 'not-a-date'}))
                count += 1
        original = digest(event, 'store-1', payload)
        assert original == digest(event, 'store-1', copy.deepcopy(payload))
        assert original != digest(event, 'store-2', payload)
        assert original != digest(event, 'store-1', dict(payload, operation_id='other'))
        assert original != digest(event, 'store-1', dict(payload, project_id='other-project'))
        count += 4
        if 'after_revision' in payload:
            assert not semantic(dict(payload, after_revision=payload['before_revision']), row['scope_policy'], event)
            count += 1
        if event == 'lsp.server.lifecycle_changed':
            assert not semantic(dict(payload, state=payload['previous_state']), row['scope_policy'], event)
            count += 1
        assert producer_witness_allowed(event, row['producer_witness_positive'])
        count += 1
        for case in row['producer_witness_negatives']:
            assert not producer_witness_allowed(event, case['witness'])
            count += 1
        for case in row['retry_cases']:
            decision, receipt, effects = replay_decision(case['original_semantic_digest'], case['retry_semantic_digest'], case['original_receipt_ref'])
            assert decision == case['expected'] and effects == 0
            assert receipt == (case['original_receipt_ref'] if decision == 'return_original_without_effect' else None)
            count += 2
        # Each exact family has independent read-fence vectors, no sibling credit.
        assert read_allowed('current', 'current', True, True, False, '1.0.0')
        for vector in [('new','old',True,True,False,'1.0.0'), ('c','c',False,True,False,'1.0.0'), ('c','c',True,False,False,'1.0.0'), ('c','c',True,True,True,'1.0.0'), ('c','c',True,True,False,'2.0.0')]:
            assert not read_allowed(*vector)
        count += 6
        count += run_exact_family(row)
        for value in row['timestamp_representation_cases']['positive']:
            for field in ('occurred_at_utc', 'observed_at_utc', 'persisted_at_utc'):
                assert publication(row, timestamp_state(row, value, field))['terminal'] is True, (event, 'valid UTC timestamp', field, value)
                count += 1
        count += run_numeric_family(row)
        print(event + ': payload/full-envelope/original-joins/admission/receipt/withdrawal/rebuild vectors PASS; native NOT_RUN')
    print(json.dumps({'status': 'PASS', 'assertions': count, 'native_execution': 'NOT_RUN'}))


if __name__ == '__main__':
    main()
