#!/usr/bin/env python3
"""Static DM contract oracles. Synthetic checks; no native execution proof."""
import copy
import hashlib
import json
import base64
import re
import importlib.util
from functools import lru_cache
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
    try:
        parsed = datetime.fromisoformat(value.replace('Z', '+00:00'))
        return parsed.tzinfo is not None
    except ValueError:
        return False

ROOT = Path(__file__).resolve().parents[1]
INLINE_LIMIT = 16 * 1024


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
    return hashlib.sha256(json.dumps([event, '1.0.0', instance, payload['project_id'], payload['operation_id']], ensure_ascii=False, separators=(',', ':')).encode()).hexdigest()


def semantic(payload, scope, event):
    if scope == 'project_only' and not payload['project_id']:
        return False
    if 'after_revision' in payload and payload['after_revision'] != payload['before_revision'] + 1:
        return False
    if event == 'lsp.server.lifecycle_changed' and payload['previous_state'] == payload['state']:
        return False
    return True


def read_allowed(current_token, selected_token, permission, source_present, withdrawn, version):
    return current_token == selected_token and permission and source_present and not withdrawn and version == '1.0.0'


def replay_decision(original_digest, retry_digest, original_receipt):
    if original_digest != retry_digest:
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
    return witness == required


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


def canonical_fixture_msgpack(value):
    """Case L-2 exact subset used here: nil/bool/integers/UTF-8/arrays/maps.

    DM payloads contain no float/binary values. Refuse unsupported values instead
    of coercing them. The complete-value recipe is checked against canon's
    pre-existing golden preimage as well as every exact-family retained value.
    """
    def sized(n, small, limits):
        if n < small[0]:
            return bytes([small[1] + n])
        for bound, marker, size in limits:
            if n < bound:
                return bytes([marker]) + n.to_bytes(size, 'big')
        raise ValueError('fixture value outside codec range')
    if value is None:
        return b'\xc0'
    if type(value) is bool:
        return b'\xc3' if value else b'\xc2'
    if type(value) is int:
        if 0 <= value <= 127:
            return bytes([value])
        if -32 <= value < 0:
            return bytes([value & 255])
        if value >= 0:
            for size, marker in [(1, 0xcc), (2, 0xcd), (4, 0xce), (8, 0xcf)]:
                if value < 1 << (8 * size):
                    return bytes([marker]) + value.to_bytes(size, 'big')
        else:
            for size, marker in [(1, 0xd0), (2, 0xd1), (4, 0xd2), (8, 0xd3)]:
                if value >= -(1 << (8 * size - 1)):
                    return bytes([marker]) + value.to_bytes(size, 'big', signed=True)
        raise ValueError('integer outside codec range')
    if type(value) is str:
        raw = value.encode('utf-8')
        return sized(len(raw), (32, 0xa0), [(256, 0xd9, 1), (65536, 0xda, 2), (2**32, 0xdb, 4)]) + raw
    if type(value) is list:
        return sized(len(value), (16, 0x90), [(65536, 0xdc, 2), (2**32, 0xdd, 4)]) + b''.join(canonical_fixture_msgpack(v) for v in value)
    if type(value) is dict and all(type(k) is str for k in value):
        keys = sorted(value, key=lambda k: k.encode('utf-8'))
        return sized(len(keys), (16, 0x80), [(65536, 0xde, 2), (2**32, 0xdf, 4)]) + b''.join(canonical_fixture_msgpack(k) + canonical_fixture_msgpack(value[k]) for k in keys)
    raise ValueError('unsupported fixture MessagePack type')


def full_value_preimage(event):
    return canonical_fixture_msgpack([
        'pm.storage.original_event_value_commitment.v1', '1.0.0',
        'pm.seglog_frame_v2.event_value.canonical_msgpack.v1',
        event['schema_id'], event['schema_version'], event,
    ])


def producer_digest(event):
    # All fixture values are integer/string/bool/null; this is RFC 8785 on that
    # subset. No floating-point or non-ASCII object-key approximation is used.
    selected = {k: event[k] for k in PRODUCER_FIELDS}
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
        if descriptor['byte_size'] <= INLINE_LIMIT or storage.get('descriptor') != descriptor:
            return None
        if event['payload_ref'] != payload_reference(descriptor):
            return None
    return body if Draft202012Validator(schema, format_checker=FORMATS).is_valid(body) else None


def envelope_valid(event):
    envelope = json.loads((ROOT / 'Plans/event_record.schema.json').read_text())
    return Draft202012Validator(envelope, format_checker=FORMATS).is_valid(event)


def custody_valid(custody):
    schema = json.loads((ROOT / 'Plans/event_append_receipt_contracts.schema.json').read_text())
    return Draft202012Validator(dict(schema, **{'$ref': '#/$defs/custody_v2'}), format_checker=FORMATS).is_valid(custody)


def valid_event(row, event, original):
    payload_schema = json.loads((ROOT / row['schema']).read_text())
    if not envelope_valid(event):
        return False
    payload = resolved_payload(event, payload_schema, original.get('payload_storage'))
    if payload is None:
        return False
    time_field, profile, owner = FAMILY_BINDINGS[row['event_type']]
    if original.get('owner') != owner or original.get('operation_id') != payload['operation_id']:
        return False
    if original.get('result_operation_id') != original['operation_id'] or original.get('result_payload') != payload:
        return False
    if not producer_witness_allowed(row['event_type'], original.get('producer_witness')):
        return False
    if not semantic(payload, row['scope_policy'], row['event_type']):
        return False
    if any(event[k] != original['envelope_joins'][k] for k in ORIGINAL_JOINS):
        return False
    if event['project_id'] != payload['project_id']:
        return False
    if event['occurred_at_utc'] != payload[time_field] or event['occurred_at_utc'] != original['completed_at_utc']:
        return False
    if event['event_type'] != row['event_type'] or event['payload_schema_id'] != payload_schema['$id']:
        return False
    if event['redaction_profile'] != profile or event['replay_policy'] != 'dedupe_by_idempotency_key':
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


def publication(row, state):
    """Fixture append adapter: no owner effects are invoked or undone."""
    outcome = {'durable_events': 0, 'receipt': None, 'terminal': False, 'owner_effects': 0}
    if append_policy_refusal(state['event']) is not None:
        return outcome
    if not all(state[k] for k in ADMISSION_GATES):
        return outcome
    original = state['original_operation']
    if state['admission_epoch'] != original['accepted_admission_epoch'] or original['accepted_admission_epoch'] != state['current_admission_epoch']:
        return outcome
    if original['accepted_session_id'] != state['current_owner_session_id'] or original['restore_occurrence_id'] != state['current_restore_occurrence_id']:
        return outcome
    if not valid_event(row, state['event'], state['original_operation']):
        return outcome
    if not state['frame_written'] or not state['group_synced']:
        return outcome
    # A durable group commit IS first issuance. A lagging custody row is rebuilt
    # from it; row presence is never an additional issuance phase.
    outcome['durable_events'] = 1
    if state['receipt_delivery']:
        # Issuance is protected by the committed original full-value authority.
        # A foreign/mutated delivery cannot publish success or undo its frame.
        replay = resolve_full_value(row, state['event'], state['committed_authority'])
        if replay is None or replay[1] != state['first_append_receipt']:
            return outcome
        outcome['receipt'] = copy.deepcopy(state['first_append_receipt'])
        outcome['terminal'] = state['terminal_delivery']
    return outcome


def resolve_original(row, incoming, authority):
    """Immutable semantic replay can outlive owner request/source handles."""
    if not custody_valid(authority['stored_custody']) or not authority['protected_authority_current']:
        return None
    payload_schema = json.loads((ROOT / row['schema']).read_text())
    if not envelope_valid(authority['stored_event']):
        return None
    if resolved_payload(authority['stored_event'], payload_schema, authority.get('payload_storage')) is None:
        return None
    stored, receipt, result = authority['stored_event'], authority['stored_custody']['first_append_receipt'], authority['original_append_result']
    custody = authority['stored_custody']
    expected_identity = (stored['event_id'], scope_partition(stored), stored['event_type'], stored['idempotency_key'], producer_digest(stored))
    actual_identity = tuple(custody[k] for k in ['event_id', 'scope_partition', 'event_type', 'idempotency_key', 'producer_semantic_digest'])
    if expected_identity != actual_identity or custody['storage_instance_id'] != authority['storage_instance_id']:
        return None
    if incoming['event_id'] != stored['event_id'] or incoming['event_type'] != stored['event_type'] or incoming['idempotency_key'] != stored['idempotency_key'] or producer_digest(incoming) != producer_digest(stored):
        return None
    if result != {'event_id': stored['event_id'], 'sequence_id': stored['sequence_id'], 'segment_ref': custody['original_segment_ref'], 'byte_offset': receipt['byte_offset']}:
        return None
    if receipt['event_id'] != stored['event_id'] or receipt['sequence_id'] != stored['sequence_id']:
        return None
    if receipt != authority['first_append_receipt']:
        return None
    return copy.deepcopy((result, receipt))


def resolve_full_value(row, requested, authority):
    replay = resolve_original(row, requested, authority)
    if replay is None:
        return None
    commitment = authority['stored_custody']['original_event_value_commitment']
    if commitment['sha256'] != hashlib.sha256(full_value_preimage(requested)).hexdigest() or commitment['sha256'] != hashlib.sha256(full_value_preimage(authority['stored_event'])).hexdigest():
        return None
    return replay


def current_retry(row, incoming, authority):
    """Current writer policy admission precedes immutable semantic resolution."""
    if append_policy_refusal(incoming) is not None:
        return (append_policy_refusal(incoming), None, 0)
    if incoming.get('replay_policy') != 'dedupe_by_idempotency_key':
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
    strict = validators.extend(Draft202012Validator, {'pattern': full_pattern})
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
    token = checkpoint.get('durable_read_token')
    selected = state.get('selected_live_token')
    original = state['retained_authority']
    if not token_matches_original(token, original, durable=True) or not token_matches_original(selected, original):
        return False
    return (
        token == {k: v for k, v in selected.items() if k != 'redb_snapshot_id'}
        and checkpoint.get('frontier_revision') == token['frontier_revision']
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
        and authority['source_selection'] == selected['source_selection']
        and resolve_full_value(row, event, authority) is not None
    )


def reader_result(row, state):
    return 'available' if (
        state['reader_enabled'] and state['permission_current'] and state['source_present']
        and state['deletion_clear'] and state['hold_allows_disclosure']
        and state['version'] == '1.0.0' and state['current_frontier_verified']
        and token_matches_original(state['live_token'], state['retained_authority'])
        and state['live_token'] == state['selected_token']
        and retained_event_valid(row, state['event'], state['retained_authority'], state['live_token'])
    ) else 'unavailable'


def rebuild_publication(row, state):
    old = copy.deepcopy(state['old_publication'])
    if not all(state[k] for k in REBUILD_GATES):
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
        check(not Draft202012Validator(schema, format_checker=FORMATS).is_valid(patched(row['positive_payload'], case['patches'])), case['case_id'])
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
    check(Draft202012Validator(dict(token_schema, **{'$ref': '#/$defs/read_token'}), format_checker=FORMATS).is_valid(live), 'ten-field live read token')
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


def main(guard_first=None):
    fixtures = json.loads((ROOT / 'Plans/small_owner_event_fixtures.json').read_text())
    assert len(fixtures['families']) == len(FAMILY_BINDINGS) and {r['event_type'] for r in fixtures['families']} == set(FAMILY_BINDINGS)
    spec = importlib.util.spec_from_file_location('dm_guard_oracles', ROOT / 'scripts/pm-small-owner-guard-audit.py')
    guard_oracles = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(guard_oracles)
    isolation_count = guard_oracles.normal_checks(globals(), fixtures, guard_first)
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
    count = 2 + len(schema_paths) + reference_count + settings_count + isolation_count
    for row in fixtures['families']:
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
        validator = Draft202012Validator(schema, format_checker=FORMATS)
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
        print(event + ': payload/full-envelope/original-joins/admission/receipt/withdrawal/rebuild vectors PASS; native NOT_RUN')
    print(json.dumps({'status': 'PASS', 'assertions': count, 'native_execution': 'NOT_RUN'}))


if __name__ == '__main__':
    main()
