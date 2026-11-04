"""DO append/retry/transport/read relational oracles. Native authority NOT_RUN.

Fixtures assume a verified source adapter and an admitted generic publication.
They test joins, not native CRC, custody authentication, redb CAS or durability.
"""
import base64
import copy
import hashlib
import json
import re
from functools import lru_cache

import blake3
import msgpack
import rfc8785
from jsonschema import Draft202012Validator, ValidationError, validators
from referencing import Registry, Resource

from pm_event_index_binding import binding_digest
from pm_projects_refresh_contracts import semantic_hash, scope_failures


SEMANTIC_FIELDS = (
    'event_type', 'scope_kind', 'project_id', 'thread_id', 'run_id', 'node_id',
    'attempt_id', 'actor_ref', 'requested_account_ref', 'effective_account_ref',
    'occurred_at_utc', 'producer_sequence_id', 'correlation_id', 'causation_event_id',
    'parent_event_id', 'idempotency_key', 'payload_schema_id', 'payload', 'payload_ref',
    'redaction_profile', 'migration',
)
LIMIT = 16384
BODY_FIELDS = {
    'subagent.completed': 'result_summary', 'subagent.failed': 'error_message',
    'subagent.message_received': 'response_preview', 'subagent.message_sent': 'message_preview',
    'subagent.progress': 'status_text', 'subagent.started': 'prompt_preview',
    'subagent.timeout': 'partial_result', 'subagent.tool_called': 'tool_args_preview',
}
PROJECT_MESSAGE_FIELDS = frozenset((
    'message_id', 'from_agent_id', 'from_platform', 'to_agent_id', 'to_agent_type',
    'to_node_id', 'to_lane_id', 'message_type', 'priority', 'subject', 'content',
    'content_ref', 'context', 'thread_id', 'in_reply_to', 'created_at', 'read_by', 'resolved',
))
PROJECT_SOURCE_FIELDS = frozenset((
    'scope', 'storage_instance_id', 'server_id', 'thread_id', 'crew_id', 'run_id',
    'operation_id', 'project_id', 'edition', 'interface', 'message_schema', 'message_ids',
    'original_input',
))


def exact_pattern(validator, pattern, instance, schema):
    # Strengthen only anchored lexical guards; preserve JSON Schema search semantics
    # for unanchored redaction patterns. Also applies inside selected frozen inputs.
    if isinstance(instance, str) and pattern.startswith('^') and pattern.endswith('$'):
        if re.fullmatch(pattern, instance) is None:
            yield ValidationError('anchored identifier requires full match')
    else:
        yield from Draft202012Validator.VALIDATORS['pattern'](validator, pattern, instance, schema)


StrictValidator = validators.extend(Draft202012Validator, {'pattern': exact_pattern})


def packed(value):
    """Complete canonical MessagePack payload bytes, including every member/list."""
    def ordered(v):
        if isinstance(v, dict):
            return {k: ordered(v[k]) for k in sorted(v, key=lambda k: k.encode('utf-8'))}
        if isinstance(v, list):
            return [ordered(x) for x in v]
        return v
    return msgpack.packb(ordered(value), use_bin_type=True)


def semantic_digest(event):
    return hashlib.sha256(rfc8785.dumps({k: event[k] for k in SEMANTIC_FIELDS})).hexdigest()


def partition(payload):
    return ('app' if payload['scope'] == 'application' else 'project~' +
            base64.urlsafe_b64encode(payload['project_id'].encode()).decode().rstrip('='))


def pack_entry(value, media_type='application/msgpack'):
    data = packed(value) if media_type == 'application/msgpack' else value.encode('utf-8')
    return {'blake3_id': 'blake3:' + blake3.blake3(data).hexdigest(),
            'byte_size': len(data), 'media_type': media_type, 'value': value,
            'bytes_durable': True, 'index_durable': True}


def pack_errors(entry, *, large=False):
    if not isinstance(entry, dict) or set(entry) != {
            'blake3_id', 'byte_size', 'media_type', 'value', 'bytes_durable', 'index_durable'}:
        return ['payload_pack_shape']
    if (entry['media_type'] not in ('application/msgpack', 'text/plain; charset=utf-8')
            or not isinstance(entry['blake3_id'], str)
            or re.fullmatch(r'blake3:[0-9a-f]{64}', entry['blake3_id']) is None):
        return ['payload_pack_identifier']
    try:
        expected = pack_entry(entry['value'], entry['media_type'])
    except (TypeError, ValueError, UnicodeError):
        return ['payload_pack_encoding']
    if entry != expected or (large and entry['byte_size'] <= LIMIT):
        return ['payload_pack_integrity_or_durability']
    return []


def transport_errors(event, logical, packs, *, ingest_encoding='decoded'):
    errors = []
    try:
        if len(packed(event['payload'])) > LIMIT:
            errors.append('inline_payload_over_16k')
        if event['payload_ref'] is None:
            if event['payload'] != logical:
                errors.append('inline_payload_join')
        else:
            entry = packs.get(event['payload_ref'])
            errors += pack_errors(entry, large=True)
            if (event['payload'] != {} or not entry or entry['value'] != logical
                    or entry['blake3_id'] != event['payload_ref']
                    or entry['media_type'] != 'application/msgpack'):
                errors.append('external_payload_join')
        if 'content_ref' in logical:
            ref = logical['content_ref']
            entry = packs.get(ref['blake3_id'])
            errors += pack_errors(entry, large=True)
            if not entry or any(entry.get(k) != v for k, v in ref.items()):
                errors.append('content_reference_join')
        # An actual ingest adapter identifies encoded input. Literal text may
        # contain a data URI; its characters cannot prove an ingest encoding.
        if ingest_encoding != 'decoded':
            errors.append('inline_base64_body')
    except (TypeError, ValueError, UnicodeError, KeyError):
        errors.append('payload_encoding')
    return errors


def predicate_errors(family, payload, context, retry_allowed):
    if family == 'phase.force_completed':
        if (context.get('phase_state') != 'active' or context.get('completion_signal') is not False
                or payload['question_count'] <= payload['max_questions'] + 1
                or context.get('max_questions') != payload['max_questions']):
            return ['phase_force_predicate']
    if family == 'subagent.output_truncated' and payload['original_length'] < payload['truncated_length']:
        return ['truncation_grows_output']
    if family == 'subagent.retried':
        joins = ('retry_cause', 'prior_attempt_number', 'attempt_number', 'child_run_id', 'parent_run_id')
        if any(payload[k] != context.get(k) for k in joins) or not retry_allowed(context):
            return ['retry_payload_source_predicate']
    return []


@lru_cache(maxsize=4)
def selected_validators(root, format_checker):
    names = ('application_workflow_contracts', 'application_workflow_sources',
             'shared_integration_runtime', 'event_record_index_checkpoint', 'event_record')
    documents = {name: json.loads((root / 'Plans' / (name + '.schema.json')).read_text()) for name in names}
    def refuse(uri):
        raise ValueError('unselected schema URI: ' + uri)
    registry = Registry(retrieve=refuse)
    for name, schema in documents.items():
        resource = Resource.from_contents(schema)
        registry = registry.with_resources([(schema['$id'], resource),
                ('https://puppetmaster.local/Plans/' + name + '.schema.json', resource)])
    result = {}
    for key, name, definition in (
        ('source', 'application_workflow_sources', 'OriginalCoordinationAppendSource'),
        ('input', 'application_workflow_contracts', 'AgentMessageApplicationV1'),
        ('wrapper', 'application_workflow_contracts', 'CrewBoardMessageStorageApplicationV1'),
        ('checkpoint', 'event_record_index_checkpoint', 'checkpoint'),
        ('read_token', 'event_record_index_checkpoint', 'read_token'),
        ('event', 'event_record', None),
    ):
        uri = documents[name]['$id'] + ('#/$defs/' + definition if definition else '')
        result[key] = StrictValidator({'$ref': uri}, registry=registry, format_checker=format_checker)
    return result


def event_errors(case, schema, identity, retry_allowed, root, formats):
    event, payload = case['event'], case['logical_payload']
    v = selected_validators(root, formats)
    errors = ['event_schema'] if list(v['event'].iter_errors(event)) else []
    if event.get('replay_policy') == 'projector_replay_only':
        errors.append('replay_only_not_appendable')
    elif event.get('replay_policy') != 'dedupe_by_idempotency_key':
        errors.append('family_current_replay_policy')
    if list(StrictValidator(schema['$defs'][case['definition']], format_checker=formats).iter_errors(payload)):
        return errors + ['logical_payload_schema']
    family = case['event_type']
    if event.get('event_type') != family or re.fullmatch(r'[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+', event.get('event_type', '')) is None:
        errors.append('event_type_join')
    key, event_id = identity(family, payload)
    expected = {'idempotency_key': key, 'event_id': event_id, 'scope_kind': payload['scope'],
                'project_id': payload.get('project_id'), 'thread_id': payload['thread_id'],
                'run_id': payload['run_id'], 'occurred_at_utc': payload['occurred_at_utc'],
                'payload_schema_id': payload['schema_id'] + '@' + payload['schema_version']}
    errors += ['event_join_' + k for k, value in expected.items() if event.get(k) != value]
    if case['scope_partition'] != partition(payload):
        errors.append('scope_partition')
    errors += predicate_errors(family, payload, case['producer_context'], retry_allowed)
    errors += transport_errors(event, payload, case['payload_packs'],
                               ingest_encoding=case.get('ingest_encoding', 'decoded'))
    return errors


def board_source_errors(case, root, formats):
    """Validate the selected closed original, not a hand-written source summary."""
    payload, source = case['payload'], case['source']
    errors = []
    if payload['scope'] != 'application':
        # Project source is the unchanged original codec behind an explicit
        # synthetic adapter; the canonical board message itself is joined below.
        for k in ('scope', 'storage_instance_id', 'server_id', 'thread_id', 'crew_id', 'run_id', 'operation_id', 'project_id'):
            if source.get(k) != payload.get(k):
                errors.append('source_' + k)
        if source.get('edition') != 'original_project_coordination_source' or source.get('interface') != 'storage.coordination_append.v1@1.0.0':
            errors.append('source_edition')
        message = source.get('original_input', {})
        if set(source) != PROJECT_SOURCE_FIELDS or set(message) != PROJECT_MESSAGE_FIELDS:
            return errors + ['project_original_input_shape']
        if source.get('message_ids') != payload.get('message_ids', [payload.get('message_id')]):
            errors.append('message_source')
    else:
        v = selected_validators(root, formats)
        wrapper = case['wrapper']
        for kind, value in [('source', source), ('input', source.get('original_input')), ('wrapper', wrapper)]:
            if list(v[kind].iter_errors(value)):
                errors.append('application_' + kind + '_schema')
        if errors:
            return errors
        message = source['original_input']
        if len(packed(wrapper)) > LIMIT:
            errors.append('application_wrapper_over_16k')
        if (message['inline_text'] is None) == (message['blake3_payload_ref'] is None):
            errors.append('application_message_body_representation')
        errors += scope_failures(source) + scope_failures(wrapper)
        for value in (source, wrapper):
            for k in ('storage_instance_id', 'server_id'):
                if value[k] != payload[k]:
                    errors.append('source_' + k)
        if (source['original_operation_id'] != payload['operation_id'] or source['thread_id'] != payload['thread_id']
                or source['scope'] != message['scope'] or wrapper['scope'] != message['scope']
                or wrapper['record'] != message):
            errors.append('source_original_join')
        if source['original_input_semantic_sha256'] != semantic_hash('accepted_source', message):
            errors.append('source_input_digest')
        if source['original_output_semantic_sha256'] != (None if source['original_output'] is None else semantic_hash('accepted_source', source['original_output'])):
            errors.append('source_output_digest')
        if source['source_sha256'] != semantic_hash('accepted_source', {k: x for k, x in source.items() if k != 'source_sha256'}):
            errors.append('source_digest')
        for name, stage in source['stage_custody'].items():
            if stage['original_operation_id'] != source['original_operation_id']:
                errors.append('source_stage_operation')
        for k in ('thread_id', 'crew_id', 'run_id'):
            if message[k] != payload[k]:
                errors.append('message_' + k)
        ids = payload.get('message_ids', [payload.get('message_id')])
        if ids != [message['message_id']]:
            errors.append('message_source')
        key = 'crew_board_message.application.v1:' + ':'.join(
            payload[k].encode().hex() for k in ('storage_instance_id', 'server_id', 'thread_id', 'crew_id', 'run_id', 'message_id')
        ) if 'message_id' in payload else 'crew_board_message.application.v1:' + ':'.join(
            value.encode().hex() for value in (payload['storage_instance_id'], payload['server_id'], payload['thread_id'], payload['crew_id'], payload['run_id'], message['message_id']))
        if case['wrapper_key'] != key:
            errors.append('wrapper_key_join')
    if case['event_type'] == 'crew.board_message_posted':
        if payload['scope'] == 'application':
            # Frozen app input has no such members. Do not manufacture them or
            # default them from the EventRecord being proved. This facet is STOPPED.
            errors.append('application_post_subject_priority_unavailable')
        else:
            for k in ('message_id', 'from_agent_id', 'subject', 'priority'):
                if message.get(k) != payload.get(k):
                    errors.append('message_' + k)
        if payload['scope'] == 'application':
            if message['sender_agent_id'] != payload['from_agent_id']:
                errors.append('message_sender')
            if message['receiver_agent_id'] != payload.get('to_agent_id'):
                errors.append('message_target')
            if 'to_agent_type' in payload:
                errors.append('application_post_target_type_unavailable')
            if (message['inline_text'] != payload.get('content')
                    or message['blake3_payload_ref'] != payload.get('content_ref', {}).get('blake3_id')):
                errors.append('message_content_join')
        elif (message.get('content') != payload.get('content')
              or message.get('content_ref') != payload.get('content_ref')):
            errors.append('message_content_join')
    return errors


def retry_outcome(original, candidate):
    # Refuse replay-only even if event/key and semantic fields are identical.
    if candidate['replay_policy'] == 'projector_replay_only':
        return {'status': 'replay_only_not_appendable', 'appended': False, 'receipt': None}
    selected = (original['scope_kind'], original['project_id'], original['event_type'], original['idempotency_key'])
    proposed = (candidate['scope_kind'], candidate['project_id'], candidate['event_type'], candidate['idempotency_key'])
    if selected != proposed or original['event_id'] != candidate['event_id']:
        return {'status': 'different_identity', 'appended': False, 'receipt': None}
    if semantic_digest(original) != semantic_digest(candidate):
        return {'status': 'idempotency_conflict', 'appended': False, 'receipt': None}
    return {'status': 'original_result', 'appended': False, 'receipt': copy.deepcopy(original)}


def checkpoint_errors(case, root, formats):
    read = case['read']; cp, token, row = read['checkpoint'], read['read_token'], read['row']
    v = selected_validators(root, formats)
    if list(v['checkpoint'].iter_errors(cp)) or list(v['read_token'].iter_errors(token)):
        return ['checkpoint_schema']
    event, payload = case['event'], case['logical_payload']
    errors = []
    storage_id = payload['storage_instance_id']
    if cp['storage_instance_id'] != storage_id or token['storage_instance_id'] != storage_id:
        errors.append('checkpoint_storage_identity')
    generation_id = cp['current_generation_id']
    node = cp['generations'].get(generation_id)
    if node is None or node['state'] != 'current' or sum(n['state'] == 'current' for n in cp['generations'].values()) != 1:
        return errors + ['checkpoint_not_current']
    frontier = node['frontier']
    key = 'event_record_index_checkpoint.v1:' + storage_id
    expected = {'storage_instance_id': storage_id, 'checkpoint_key': key,
        'checkpoint_ref': key + '#/generations/' + generation_id, 'generation_id': generation_id,
        'generation_anchor_sha256': binding_digest(node['anchor']),
        'frontier_revision': frontier['publication_revision'], 'frontier_sha256': binding_digest(frontier),
        'index_dataset_name': 'event_record_index.v2@' + generation_id,
        'source_selection': frontier['source_selection'], 'redb_snapshot_id': read['snapshot_id']}
    if token != expected or read['current_source_selection'] != frontier['source_selection']:
        errors.append('checkpoint_read_token_join')
    for selection in (node['anchor']['source_selection'], frontier['source_selection']):
        if selection['storage_instance_id'] != storage_id:
            errors.append('checkpoint_source_storage_identity')
    expected_row = {'scope_kind': event['scope_kind'], 'project_id': event['project_id'],
        'scope_partition': case['scope_partition'], 'sequence_id': event['sequence_id'],
        'event_id': event['event_id'], 'event_type': event['event_type'],
        'producer_semantic_digest': semantic_digest(event), 'idempotency_key': event['idempotency_key']}
    errors += ['index_row_' + k for k, value in expected_row.items() if row.get(k) != value]
    row_key = f"event_record_index.v2:{case['scope_partition']}:{event['sequence_id']:020}:{event['event_id']}"
    if read['row_key'] != row_key or row['publication_locator']['checkpoint_ref'] != token['checkpoint_ref']:
        errors.append('index_row_locator_join')
    if (read['source_event'] != event
            or read['source_value_sha256'] != hashlib.sha256(packed(event)).hexdigest()):
        errors.append('index_original_source_join')
    row_schema = index_row_schema(root)
    if list(StrictValidator(row_schema, format_checker=formats).iter_errors(row)):
        errors.append('index_row_schema')
    expected_set = binding_digest({'domain': 'pm.event_index.row_set.v1',
                                  'entries': [{'key': read['row_key'], 'value': row}]})
    if frontier['index_row_count'] != 1 or frontier['index_row_set_sha256'] != expected_set:
        errors.append('index_complete_row_set')
    expected_prefix = binding_digest({'domain': 'pm.event_index.retained_prefix.v1', 'entries': [{
        'sequence_id': event['sequence_id'], 'event_id': event['event_id'],
        'scope_partition': case['scope_partition'], 'source_value_sha256': read['source_value_sha256']}]})
    if any(x != expected_prefix for x in (node['anchor']['retained_event_prefix_sha256'],
            frontier['coverage']['retained_event_prefix_sha256'],
            node['anchor']['source_selection']['manifest_survivor_prefix_sha256'],
            frontier['source_selection']['manifest_survivor_prefix_sha256'])):
        errors.append('index_source_prefix')
    if any(row['publication_locator'][k] != node['anchor']['source_selection'][field] for k, field in (
            ('manifest_generation', 'manifest_generation'), ('recovery_epoch', 'recovery_epoch'),
            ('survivor_prefix_sha256', 'manifest_survivor_prefix_sha256'))):
        errors.append('index_birth_anchor_join')
    coverage = frontier['coverage']
    if (coverage['through_sequence_id'] != event['sequence_id']
            or coverage['first_retained_sequence_id'] != event['sequence_id']
            or coverage['retained_event_count'] != 1 or not coverage['complete_to_captured_boundary']
            or coverage['last_frame']['last_event_id'] != event['event_id']
            or coverage['last_frame']['last_sequence_id'] != event['sequence_id']):
        errors.append('index_complete_source_coverage')
    return errors


@lru_cache(maxsize=4)
def index_row_schema(root):
    registry = json.loads((root / 'Plans/storage_value_registry.json').read_text())
    return next(row['value_schema'] for row in registry['families'] if row['family_id'] == 'event_record_index')


def check_oracles(fixtures, schema, owner_module):
    root, formats = owner_module.ROOT, owner_module.UTC_FORMAT
    checks = 0
    cases = fixtures['event_cases']
    assert len(cases) == len(fixtures['valid_payloads'])
    for case, source in zip(cases, fixtures['valid_payloads']):
        assert case['logical_payload'] == source['payload'], ('event_payload_source_join', case['case_id'])
        assert case['event_type'] == source['event_type'] and case['definition'] == source['definition']
        assert case['scope_partition'] == source['identity']['scope_partition']
        errors = event_errors(case, schema, owner_module.identity, owner_module.retry_allowed, root, formats)
        assert not errors, (case['case_id'], errors)
        errors = checkpoint_errors(case, root, formats)
        assert not errors, (case['case_id'], errors)
        for field in case['read']['read_token']:
            bad = copy.deepcopy(case)
            token = bad['read']['read_token']
            token[field] = (token[field] + 1 if isinstance(token[field], int) else
                            dict(token[field], manifest_generation=999) if isinstance(token[field], dict)
                            else token[field] + '-foreign')
            assert checkpoint_errors(bad, root, formats), (case['case_id'], field)
            checks += 1
        # A nonmatching append advances the generic frontier even when this
        # family's source row is unchanged, invalidating the old full token.
        bad = copy.deepcopy(case)
        gid = bad['read']['checkpoint']['current_generation_id']
        bad['read']['checkpoint']['generations'][gid]['frontier']['publication_revision'] += 1
        assert 'checkpoint_read_token_join' in checkpoint_errors(bad, root, formats)
        checks += 1
        original = case['event']
        assert semantic_digest(original) == case['producer_semantic_digest']
        for field, value in [('sequence_id', original['sequence_id'] + 19),
                             ('observed_at_utc', '2026-11-04T01:00:00Z'),
                             ('persisted_at_utc', '2026-11-04T02:00:00Z')]:
            candidate = copy.deepcopy(original); candidate[field] = value
            result = retry_outcome(original, candidate)
            assert result == {'status': 'original_result', 'appended': False, 'receipt': original}
            checks += 1
        for field in SEMANTIC_FIELDS:
            candidate = copy.deepcopy(original)
            if field == 'payload':
                candidate[field] = dict(candidate[field], changed_semantics=True)
            elif field == 'migration':
                candidate[field] = dict(candidate[field], migration_id='other-migration')
            elif field == 'producer_sequence_id':
                candidate[field] = 97
            else:
                candidate[field] = 'other-semantic-value'
            assert semantic_digest(candidate) != semantic_digest(original), field
            if field not in ('scope_kind', 'project_id', 'event_type', 'idempotency_key'):
                assert retry_outcome(original, candidate)['status'] == 'idempotency_conflict', field
            checks += 1
        checks += 6
    by_id = {c['case_id']: c for c in cases}
    assert len(by_id) == len(cases)
    for test in fixtures['retry_cases']:
        original = by_id[test['case_id']]['event']
        assert selected_validators(root, formats)['event'].is_valid(test['candidate']), test['name']
        result = retry_outcome(original, test['candidate'])
        assert result['status'] == test['expected_status'], (test['name'], result['status'])
        assert result['appended'] is False
        assert result['receipt'] == (original if test['expected_status'] == 'original_result' else None)
        checks += 4
    for case in cases:
        assert {t['kind'] for t in fixtures['retry_cases'] if t['case_id'] == case['case_id']} == {
            'same', 'storage_metadata_changed', 'caller_semantics_changed', 'replay_only'}, case['case_id']
        checks += 1
    for family in fixtures['contracts']:
        tests = [c for c in fixtures['standing_cases'] if c['event_type'] == family['event_type']]
        assert {c['standing_check'] for c in tests} == set(range(1, 9)), family['event_type']
        for test in tests:
            base = by_id[test['case_id']]
            assert base['event_type'] == family['event_type']
            assert test['expected_exit_code'] == 1, ('failure_oracle_success_code', test['name'])
            bad = copy.deepcopy(base)
            kind = test['mutation']
            if kind == 'replay_only':
                bad['event']['replay_policy'] = 'projector_replay_only'
                errors = event_errors(bad, schema, owner_module.identity, owner_module.retry_allowed, root, formats)
                assert retry_outcome(base['event'], bad['event'])['status'] == 'replay_only_not_appendable'
            elif kind == 'application_key':
                bad['event']['idempotency_key'] = 'do1:' + 'a' * 64
                errors = event_errors(bad, schema, owner_module.identity, owner_module.retry_allowed, root, formats)
            elif kind == 'application_for_project_only':
                bad['logical_payload']['scope'] = 'application'; bad['logical_payload'].pop('project_id')
                errors = event_errors(bad, schema, owner_module.identity, owner_module.retry_allowed, root, formats)
            elif kind == 'raw_project_partition':
                bad['scope_partition'] = bad['logical_payload']['project_id']
                errors = event_errors(bad, schema, owner_module.identity, owner_module.retry_allowed, root, formats)
            elif kind == 'oversized_inline':
                bad['event']['payload']['operation_id'] = 'x' * (LIMIT + 1)
                errors = transport_errors(bad['event'], bad['event']['payload'], {})
            elif kind == 'identifier_lf':
                bad['event']['event_type'] += '\n'
                errors = event_errors(bad, schema, owner_module.identity, owner_module.retry_allowed, root, formats)
            elif kind == 'changed_semantics':
                bad['event']['occurred_at_utc'] = '2026-11-04T00:00:01Z'
                result = retry_outcome(base['event'], bad['event'])
                errors = [result['status']] if not result['appended'] and result['receipt'] is None else []
            elif kind == 'foreign_checkpoint':
                bad['read']['checkpoint']['storage_instance_id'] = '22222222-2222-4222-8222-222222222222'
                errors = checkpoint_errors(bad, root, formats)
            elif kind == 'missing_required':
                bad['event'].pop('schema_id')
                errors = event_errors(bad, schema, owner_module.identity, owner_module.retry_allowed, root, formats)
            else:
                raise AssertionError(('unknown_negative_mutation', kind))
            assert test['expected_error'] in errors, (test['name'], errors)
            checks += 2
    # Every family gets physical inline/external/boundary and forged-reference probes.
    for test in fixtures['transport_cases']:
        base = by_id[test['case_id']]
        logical = copy.deepcopy(base['logical_payload'])
        field = test['field']
        logical[field] = test['text'] if field != 'message_ids' else [test['text']]
        event = copy.deepcopy(base['event']); event['payload'] = logical; event['payload_ref'] = None
        packs = copy.deepcopy(base['payload_packs'])
        if test['representation'] == 'external':
            entry = pack_entry(logical); event['payload'] = {}; event['payload_ref'] = entry['blake3_id']
            packs[entry['blake3_id']] = entry
            if test.get('forge') == 'missing':
                del packs[entry['blake3_id']]
            elif test.get('forge') == 'size':
                packs[entry['blake3_id']]['byte_size'] += 1
            elif test.get('forge') == 'digest':
                packs[entry['blake3_id']]['blake3_id'] = 'blake3:' + 'f' * 64
            elif test.get('forge') == 'media':
                packs[entry['blake3_id']]['media_type'] = 'image/png'
            elif test.get('forge') == 'not_durable':
                packs[entry['blake3_id']]['index_durable'] = False
        actual = transport_errors(event, logical, packs,
                                  ingest_encoding=test.get('ingest_encoding', 'decoded'))
        if list(StrictValidator(schema['$defs'][base['definition']], format_checker=formats).iter_errors(logical)):
            actual.append('logical_payload_schema')
        assert (not actual) == test['valid'], (test['name'], actual)
        checks += 1
    return checks
