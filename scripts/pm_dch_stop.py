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


require = shared.require
type_name = shared.type_name
TableRefusal = shared.TableRefusal
TOKEN_FIELDS = sorted(['storage_instance_id', 'checkpoint_key', 'checkpoint_ref', 'generation_id',
                       'generation_anchor_sha256', 'frontier_revision', 'frontier_sha256',
                       'index_dataset_name', 'source_selection'])
RETIREMENT_CONDITIONS = ('replacement_contract_specified', 'replacement_storage_materialized',
                         'native_restart_verified', 'native_recovery_verified',
                         'queue_and_three_second_barriers_preserved')


def refused(function):
    """Boolean boundary over a chain of table phases (st_* and reused shared rows)."""
    def boundary(*args, **kwargs):
        try:
            function(*args, **kwargs)
        except TableRefusal:
            return False
        return True
    boundary.__name__ = function.__name__.lstrip('_')
    boundary.__doc__ = function.__doc__
    return boundary


def resolve_value(record, source=None, storage_instance=shared.STORAGE_INSTANCE):
    """SP-337 transport for these two closed values, using the existing codec.

    The older test-witness type inventory reserves the field name `outcome`
    for an object. The new saved result owns a string enum at that name. Its
    own closed schema owns logical types; no older witness rule is weakened.
    """
    try:
        return _resolve_value(record, source, storage_instance)
    except TableRefusal:
        return None


def _resolve_value(record, source=None, storage_instance=shared.STORAGE_INSTANCE):
    is_record = type(record) is dict
    require('st_value', dict(record_type=type_name(record),
                             payload_type=type_name(record.get('payload')) if is_record else None,
                             store_valid=shared.STORAGE_INSTANCE_VALIDATOR.is_valid(storage_instance)))
    reference = record.get('payload_ref')
    if reference is None:
        body = record['payload']
        error, raw = shared.encoded(body)
        require('st_inline', dict(encoding_error=error, size=len(raw) if raw is not None else None))
        return body
    source_is_dict = type(source) is dict
    require('st_ref', dict(reference_type=type_name(reference), payload_empty=record['payload'] == {},
                           source_type=type_name(source),
                           body_type=type_name(source.get('body')) if source_is_dict else None))
    body = source['body']
    error, raw = shared.encoded(body)
    require('st_ref_bytes', dict(body_encoding_error=error))
    digest = shared.blake3.blake3(raw).hexdigest()
    require('st_pack_a', dict(byte_size_refusal=shared.integer_refusal(source.get('byte_size')), byte_size=source.get('byte_size'),
                              raw_size=len(raw), reference=reference,
                              expected_reference=f'payload:v1:{digest}:{len(raw)}:application/msgpack',
                              key=source.get('key'), expected_key='payload:v1:' + digest,
                              media_type=source.get('media_type'), pack_store=source.get('storage_instance_id'),
                              store=storage_instance, pack_scope=source.get('scope'), body_scope=body.get('scope')))
    require('st_pack_b', dict(pack_computer_id=source.get('computer_id'), body_computer_id=body.get('computer_id'),
                              pack_thread_id=source.get('thread_id'), body_thread_id=body.get('thread_id'),
                              **{k: source.get(k) for k in ('authorized', 'hold_access_allowed', 'bytes_durable',
                                                             'index_durable', 'readback_verified')}))
    require('st_pack_c', dict(deleted=source.get('deleted')))
    # Entailed by the exact reference above (at most 131 bytes); kept as defence in depth.
    pointer_error, pointer_raw = shared.encoded({'payload_ref': reference})
    require('st_pointer_bounds', dict(pointer_encoding_error=pointer_error,
                                      pointer_size=len(pointer_raw) if pointer_raw is not None else None))
    return body


def _request_valid(record, context, historical=False):
    """Independently observed original Store/accepted intent, not caller authority."""
    require('st_request_mode', dict(historical_type=type_name(historical)))
    shared._input_types(record)
    store = context['storage_instance_id']
    require('st_request_store', dict(store_valid=shared.STORAGE_INSTANCE_VALIDATOR.is_valid(store)))
    body = _resolve_value(record, context.get('payload_source'), store)
    require('st_request_schema', dict(request_valid=REQUEST.is_valid(body), envelope_valid=ENVELOPE.is_valid(record)))
    require('st_request_access', dict(retained=context['retained'], authorized=context['authorized'],
                                      hold_access_allowed=context['hold_access_allowed'], deleted=context['deleted'],
                                      withdrawn=context['withdrawn'], source_commitment=context['source_value_sha256'],
                                      record_commitment=commitment(record)))
    current = {k: (context[k] if not historical else None) for k in ('writer_admitted', 'active_reply', 'dedupe_available')}
    require('st_request_writer', dict(historical=historical, replay_policy=record['replay_policy'], **current))
    # Compatibility only changes which read policy is permitted. It never
    # rewrites bytes or applies a current-writer predicate to the original.
    ordinary = {**record, 'replay_policy': 'dedupe_by_idempotency_key'}
    shared._joins(ordinary, EVENT, context.get('payload_source'), store, shared.CURRENT_RULE)
    require('st_request_accepted', dict(accepted_mismatches=[k for k in ACCEPTED_FIELDS if body[k] != context['accepted'][k]]))
    return body


request_valid = refused(_request_valid)


def _outcome_valid(value, context, key):
    require('st_outcome_schema', dict(outcome_valid=OUTCOME.is_valid(value),
                                      **{k: context[k] for k in ('first_receipt_verified', 'original_intent_durable',
                                                                 'original_deadline_preserved',
                                                                 'cancel_delivery_after_receipt')}))
    request = context['request']
    source = context['request_context']
    body = _request_valid(request, source, historical=True)
    observation = context['original_decision']
    elapsed, stopped = observation['elapsed_ms'], observation['all_targets_stopped']
    require('st_outcome_decision', dict(elapsed_refusal=shared.integer_refusal(elapsed), stopped_type=type_name(stopped),
                                        stopped=stopped, elapsed_ms=elapsed))
    decided = 'cancelled' if stopped else 'timeout'
    require('st_outcome_join', dict(value_store=value['storage_instance_id'], request_store=source['storage_instance_id'],
                                    stop_request_event_id=value['stop_request_event_id'], request_event_id=request['event_id'],
                                    join_mismatches=[k for k in JOIN_FIELDS if value[k] != body[k]],
                                    outcome=value['outcome'], decided=decided, outcome_at_utc=value['outcome_at_utc'],
                                    observed_outcome_at_utc=observation['outcome_at_utc'], key=key,
                                    expected_key=outcome_key(value)))


outcome_valid = refused(_outcome_valid)


def save_outcome(value, context, key, original=None):
    """Whole-value absent CAS/repeated save model, not a physical redb writer."""
    try:
        _outcome_valid(value, context, key)
    except TableRefusal:
        return 'invalid'
    if original is None:
        require_save = dict(original_present=False, bytes_equal=None)
    else:
        require_save = dict(original_present=True, bytes_equal=shared.body_bytes(original) == shared.body_bytes(value))
    try:
        require('st_save', require_save)
    except TableRefusal as refusal:
        return refusal.code
    return 'saved' if original is None else 'original_result'


def _read_outcome(value, context, key):
    require('st_read_present', dict(value_present=value is not None))
    _outcome_valid(value, context, key)
    require('st_read', dict(result_committed=context['result_committed'], readback_verified=context['readback_verified'],
                            outcome_value_sha256=context['outcome_value_sha256'], value_commitment=commitment(value)))


read_outcome = refused(_read_outcome)


def _queue_can_advance(value, context, key, user_action):
    require('st_queue_action', dict(user_action_type=type_name(user_action), user_action=user_action))
    _read_outcome(value, context, key)
    require('st_queue_send', dict(current_send_authorized=context['current_send_authorized'],
                                  current_send_hold_clear=context['current_send_hold_clear']))


queue_can_advance = refused(_queue_can_advance)


def _index_read_valid(record, context, token, source):
    """Stop's passive SP-278 consumer joins; no domain cursor is invented."""
    _request_valid(record, context, historical=True)
    shared._input_types(token)
    shared._input_types(source)
    store = context['storage_instance_id']
    root = source['checkpoint']
    token_fields = sorted(token)
    node = root['generations'].get(token['generation_id']) if token_fields == TOKEN_FIELDS else None
    require('st_index_token', dict(token_fields=token_fields, required_fields=TOKEN_FIELDS, node_present=node is not None))
    generation = token['generation_id']
    key = 'event_record_index_checkpoint.v1:' + store
    row = source['index_row']
    body = _resolve_value(record, context.get('payload_source'), store)
    expected_ref = key + '#/generations/' + generation
    require('st_index_store', dict(token_store=token['storage_instance_id'], source_store=source['storage_instance_id'],
                                   root_store=root['storage_instance_id'],
                                   selection_store=token['source_selection']['storage_instance_id'], store=store))
    require('st_index_key', dict(token_key=token['checkpoint_key'], source_key=source['checkpoint_key'], key=key,
                                 token_ref=token['checkpoint_ref'], row_ref=row['checkpoint_ref'], expected_ref=expected_ref,
                                 current_generation=root['current_generation_id'], generation=generation,
                                 node_state=node['state']))
    require('st_index_frontier', dict(token_anchor=token['generation_anchor_sha256'], node_anchor=node['anchor_sha256'],
                                      token_frontier_revision=token['frontier_revision'],
                                      node_frontier_revision=node['frontier_revision'],
                                      token_frontier_sha256=token['frontier_sha256'], node_frontier_sha256=node['frontier_sha256'],
                                      token_selection=token['source_selection'], node_selection=node['source_selection'],
                                      current_selection=source['current_source_selection']))
    expected_dataset = 'event_record_index.v2@' + generation
    require('st_index_dataset', dict(token_dataset=token['index_dataset_name'], node_dataset=node['index_dataset_name'],
                                     source_dataset=source['dataset_name'], expected_dataset=expected_dataset))
    require('st_index_event', dict(row_event_type=row['event_type'],
                                   row_event_id=row['event_id'], record_event_id=record['event_id'],
                                   row_sequence_refusal=shared.uint64_refusal(row['sequence_id']), row_sequence_id=row['sequence_id'],
                                   record_sequence_id=record['sequence_id'],
                                   row_partition=row['scope_partition'], body_partition=body['scope']['scope_partition'],
                                   row_commitment=row['source_value_sha256'],
                                   context_commitment=context['source_value_sha256']))
    require('st_index_entailed', dict(record_event_type=record['event_type'],
                                      row_sequence_refusal=shared.uint64_refusal(row['sequence_id'])))


index_read_valid = refused(_index_read_valid)


def _retirement_ready(conditions):
    require('st_retirement', {k: conditions[k] for k in RETIREMENT_CONDITIONS})


retirement_ready = refused(_retirement_ready)


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
        check(shared.references_valid(schema, ROOT / path), 'schema closure: ' + path)
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
    # Sweep part 2A single-row witnesses for st_* guard-table rows no fixture case reached first.
    from pm_dch_guard_witnesses import stop_cases
    witnesses = stop_cases(fixture)
    for case in witnesses:
        check(case['id'] not in ids, case['id'] + ': unique case ID')
        ids.add(case['id'])
        try:
            actual = evaluate(case)
            check(type(actual) is type(case['expected']) and actual == case['expected'], case['id'] + ': ' + case['name'])
        except Exception as exc:
            check(False, case['id'] + ': exception is failure: ' + repr(exc))
        counts[case['surface']] = counts.get(case['surface'], 0) + 1
    print(json.dumps({'status': 'pass' if not failures else 'fail', 'checks': checks,
                      'cases': len(fixture['cases']), 'table_witnesses': len(witnesses), 'surfaces': counts, 'failures': failures,
                      'native_execution': 'NOT_RUN',
                      'claim_boundary': 'Synthetic original source/Store/decision observations. No native durability, authenticated provenance or SP-278 completeness/CAS. Every Stop refusal is a named st_* table row (or a reused shared row); check 11 is the shared guard tool run over those tables (scripts/pm-dch-guard-tables.py).'}, indent=2))
    return 1 if failures else 0


if __name__ == '__main__':
    raise SystemExit(main())
