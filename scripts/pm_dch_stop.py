#!/usr/bin/env python3
"""DL-406/DL-427 Stop contract oracles; source adapters are synthetic, native NOT_RUN."""
import copy
import hashlib
import json
from pathlib import Path

from jsonschema import Draft202012Validator
import pm_dch_events as shared
from pm_dch_formats import FormatChecker

ROOT = Path(__file__).resolve().parents[1]
EVENT = 'chat.response_stop_requested'
REQUEST_PATH = 'Plans/dch_stop_request.schema.json'
OUTCOME_PATH = 'Plans/dch_stop_outcome.schema.json'
REQUEST_SCHEMA = json.loads((ROOT / REQUEST_PATH).read_text())
OUTCOME_SCHEMA = json.loads((ROOT / OUTCOME_PATH).read_text())
REQUEST = Draft202012Validator(REQUEST_SCHEMA, format_checker=FormatChecker())
OUTCOME = Draft202012Validator(OUTCOME_SCHEMA, format_checker=FormatChecker())
ENVELOPE_SCHEMA = json.loads((ROOT / 'Plans/event_record.schema.json').read_text())
ENVELOPE = Draft202012Validator(ENVELOPE_SCHEMA, format_checker=FormatChecker())
JOIN_FIELDS = ('scope', 'computer_id', 'thread_id', 'assistant_turn_id', 'target_work')
ACCEPTED_FIELDS = JOIN_FIELDS + ('operation_id', 'actor_ref', 'ts', 'stop_reason_code')


def commitment(value):
    return hashlib.sha256(shared.body_bytes(value)).hexdigest()


def outcome_key(value):
    # The existing globally unique request identity already binds its original
    # accepted turn/work context. Keep the physical key fixed in size; no new
    # logical ID cap or additional serializer is needed for that context.
    return ('assistant_turn_stop_outcome.v1:' + value['storage_instance_id']
            + ':' + value['stop_request_event_id'])


def resolve_value(record, source=None, storage_instance=shared.STORAGE_INSTANCE):
    """SP-337 transport for these two closed values, using the existing codec.

    The older test-witness type inventory reserves the field name `outcome`
    for an object. The new saved result owns a string enum at that name. Its
    own closed schema owns logical types; no older witness rule is weakened.
    """
    if (type(record) is not dict or type(record.get('payload')) is not dict
            or not shared.STORAGE_INSTANCE_VALIDATOR.is_valid(storage_instance)):
        return None
    reference = record.get('payload_ref')
    if reference is None:
        body = record['payload']
        try:
            return body if len(shared.body_bytes(body)) <= shared.INLINE_LIMIT else None
        except (ValueError, OverflowError):
            return None
    if (type(reference) is not str or record['payload'] != {}
            or type(source) is not dict or type(source.get('body')) is not dict):
        return None
    body = source['body']
    try:
        raw = shared.body_bytes(body)
        if len(shared.body_bytes({'payload_ref': reference})) > shared.INLINE_LIMIT:
            return None
    except (ValueError, OverflowError):
        return None
    if (type(source.get('byte_size')) is not int or source['byte_size'] != len(raw)
            or reference != shared.payload_reference(body)
            or source.get('key') != 'payload:v1:' + shared.blake3.blake3(raw).hexdigest()
            or source.get('media_type') != 'application/msgpack'
            or source.get('storage_instance_id') != storage_instance
            or any(source.get(k) != body.get(k) for k in ('scope', 'computer_id', 'thread_id'))
            or not all(source.get(k) is True for k in (
                'authorized', 'hold_access_allowed', 'bytes_durable', 'index_durable', 'readback_verified'))
            or source.get('deleted') is not False):
        return None
    return body


def request_valid(record, context, historical=False):
    """Independently observed original Store/accepted intent, not caller authority."""
    if type(historical) is not bool or not shared.input_types_valid(record):
        return False
    store = context['storage_instance_id']
    if not shared.STORAGE_INSTANCE_VALIDATOR.is_valid(store):
        return False
    body = resolve_value(record, context.get('payload_source'), store)
    if body is None or not REQUEST.is_valid(body) or not ENVELOPE.is_valid(record):
        return False
    if not all(context[k] is True for k in ('retained', 'authorized', 'hold_access_allowed')):
        return False
    if context['deleted'] is not False or context['withdrawn'] is not False:
        return False
    if context['source_value_sha256'] != commitment(record):
        return False
    if not historical and not all(context[k] is True for k in ('writer_admitted', 'active_reply', 'dedupe_available')):
        return False
    if record['replay_policy'] not in ('dedupe_by_idempotency_key', 'projector_replay_only'):
        return False
    if not historical and record['replay_policy'] != 'dedupe_by_idempotency_key':
        return False
    # Compatibility only changes which read policy is permitted. It never
    # rewrites bytes or applies a current-writer predicate to the original.
    ordinary = {**record, 'replay_policy': 'dedupe_by_idempotency_key'}
    return (shared.joins(ordinary, EVENT, context.get('payload_source'), store)
            and all(body[k] == context['accepted'][k] for k in ACCEPTED_FIELDS))


def outcome_valid(value, context, key):
    if not OUTCOME.is_valid(value):
        return False
    if not all(context[k] is True for k in (
            'first_receipt_verified', 'original_intent_durable',
            'original_deadline_preserved', 'cancel_delivery_after_receipt')):
        return False
    request = context['request']
    source = context['request_context']
    if not request_valid(request, source, historical=True):
        return False
    body = resolve_value(request, source.get('payload_source'), source['storage_instance_id'])
    observation = context['original_decision']
    elapsed, stopped = observation['elapsed_ms'], observation['all_targets_stopped']
    if type(elapsed) is not int or type(stopped) is not bool:
        return False
    if stopped:
        if not 0 <= elapsed <= 3000:
            return False
        decided = 'cancelled'
    else:
        if elapsed != 3000:
            return False
        decided = 'timeout'
    return (value['storage_instance_id'] == source['storage_instance_id']
            and value['stop_request_event_id'] == request['event_id']
            and all(value[k] == body[k] for k in JOIN_FIELDS)
            and value['outcome'] == decided
            and value['outcome_at_utc'] == observation['outcome_at_utc']
            and key == outcome_key(value))


def save_outcome(value, context, key, original=None):
    """Whole-value absent CAS/repeated save model, not a physical redb writer."""
    if not outcome_valid(value, context, key):
        return 'invalid'
    if original is None:
        return 'saved'
    return 'original_result' if shared.body_bytes(original) == shared.body_bytes(value) else 'conflict'


def read_outcome(value, context, key):
    if value is None or not outcome_valid(value, context, key):
        return False
    return (context['result_committed'] is True
            and context['readback_verified'] is True
            and context['outcome_value_sha256'] == commitment(value))


def queue_can_advance(value, context, key, user_action):
    return (type(user_action) is bool and user_action
            and read_outcome(value, context, key)
            and context['current_send_authorized'] is True
            and context['current_send_hold_clear'] is True)


def index_read_valid(record, context, token, source):
    """Stop's passive SP-278 consumer joins; no domain cursor is invented."""
    if not request_valid(record, context, historical=True):
        return False
    if not shared.input_types_valid(token) or not shared.input_types_valid(source):
        return False
    required = {'storage_instance_id', 'checkpoint_key', 'checkpoint_ref', 'generation_id',
                'generation_anchor_sha256', 'frontier_revision', 'frontier_sha256',
                'index_dataset_name', 'source_selection'}
    if set(token) != required:
        return False
    store = context['storage_instance_id']
    root = source['checkpoint']
    generation = token['generation_id']
    node = root['generations'].get(generation)
    if node is None:
        return False
    key = 'event_record_index_checkpoint.v1:' + store
    row = source['index_row']
    body = resolve_value(record, context.get('payload_source'), store)
    return (token['storage_instance_id'] == source['storage_instance_id'] == root['storage_instance_id'] == store
            and token['source_selection']['storage_instance_id'] == store
            and token['checkpoint_key'] == source['checkpoint_key'] == key
            and token['checkpoint_ref'] == row['checkpoint_ref'] == key + '#/generations/' + generation
            and root['current_generation_id'] == generation and node['state'] == 'current'
            and token['generation_anchor_sha256'] == node['anchor_sha256']
            and token['frontier_revision'] == node['frontier_revision']
            and token['frontier_sha256'] == node['frontier_sha256']
            and token['source_selection'] == node['source_selection'] == source['current_source_selection']
            and token['index_dataset_name'] == node['index_dataset_name'] == source['dataset_name']
            == 'event_record_index.v2@' + generation
            and row['event_type'] == record['event_type'] == EVENT
            and row['event_id'] == record['event_id']
            and type(row['sequence_id']) is int and row['sequence_id'] == record['sequence_id']
            and row['scope_partition'] == body['scope']['scope_partition']
            and row['source_value_sha256'] == context['source_value_sha256'])


def retirement_ready(conditions):
    return all(conditions[k] is True for k in (
        'replacement_contract_specified', 'replacement_storage_materialized',
        'native_restart_verified', 'native_recovery_verified', 'queue_and_three_second_barriers_preserved'))


def evaluate(case):
    surface, data = case['surface'], case['input']
    if surface == 'schema_request':
        return REQUEST.is_valid(data)
    if surface == 'schema_outcome':
        return OUTCOME.is_valid(data)
    if surface == 'request':
        return request_valid(**data)
    if surface == 'outcome':
        return outcome_valid(**data)
    if surface == 'save':
        return save_outcome(**data)
    if surface == 'read':
        return read_outcome(**data)
    if surface == 'queue':
        return queue_can_advance(**data)
    if surface == 'index':
        return index_read_valid(**data)
    if surface == 'transport':
        body = resolve_value(**data)
        return body is not None and (REQUEST if case['value_kind'] == 'request' else OUTCOME).is_valid(body)
    if surface == 'retry':
        return shared.retry_outcome(**data)
    if surface == 'retirement':
        return retirement_ready(data)
    raise ValueError('Unknown case surface: ' + surface)


def main():
    failures = []
    checks = 0
    counts = {}
    def check(ok, name):
        nonlocal checks
        checks += 1
        if not ok:
            failures.append(name)
    for path, schema in ((REQUEST_PATH, REQUEST_SCHEMA), (OUTCOME_PATH, OUTCOME_SCHEMA),
                         ('Plans/event_record.schema.json', ENVELOPE_SCHEMA)):
        check(not shared.schema_reference_errors(schema, ROOT / path), 'schema closure: ' + path)
    contract = json.loads((ROOT / 'Plans/dch_stop_contracts.json').read_text())
    check(contract['event_type'] == EVENT and contract['status'] == 'prepared_without_admission', 'exact prepared family')
    registry = json.loads((ROOT / 'Plans/event_family_registry.json').read_text())
    check(not any(r.get('event_type') == EVENT for r in registry['families']), 'membership remains absent')
    applications = json.loads((ROOT / contract['retirement_application_ref']).read_text())['applications']
    check([a['event_type'] for a in applications] == ['chat_run.cancel_requested', 'chat_run.cancelled', 'chat_run.cancel_timeout'], 'three individual retirement applications')
    for application in applications:
        check(not retirement_ready(application['conditions']), application['event_type'] + ': native cutoff pending')
        check(application['application_status'] == 'retirement_specified_cutover_pending', application['event_type'] + ': honest application state')
    fixture = json.loads((ROOT / 'Plans/dch_stop_contract_fixtures.json').read_text())
    ids = set()
    for case in fixture['cases']:
        case = copy.deepcopy(case)
        case['input'] = copy.deepcopy(fixture['bases'][case['base_id']])
        # Fixture deltas are literal source data. No key, hash, source copy or
        # expected outcome is recomputed while expanding a negative.
        for change in case['changes']:
            path = change['path']
            if not path:
                case['input'] = change['value']
                continue
            target = case['input']
            for part in path[:-1]:
                target = target[part]
            if change['op'] == 'remove':
                del target[path[-1]]
            else:
                target[path[-1]] = change['value']
        check(case['id'] not in ids, case['id'] + ': unique case ID')
        ids.add(case['id'])
        try:
            actual = evaluate(case)
            check(type(actual) is type(case['expected']) and actual == case['expected'], case['id'] + ': ' + case['name'])
        except Exception as exc:
            check(False, case['id'] + ': exception is failure: ' + repr(exc))
        counts[case['surface']] = counts.get(case['surface'], 0) + 1
    print(json.dumps({'status': 'pass' if not failures else 'fail', 'checks': checks,
                      'cases': len(fixture['cases']), 'surfaces': counts, 'failures': failures,
                      'native_execution': 'NOT_RUN',
                      'claim_boundary': 'Synthetic original source/Store/decision observations. No native durability, authenticated provenance, SP-278 completeness/CAS or check-11 isolation certification. Shared proof and number-domain adoption remain sweep items.'}, indent=2))
    return 1 if failures else 0


if __name__ == '__main__':
    raise SystemExit(main())
