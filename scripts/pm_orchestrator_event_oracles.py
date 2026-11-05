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
from pathlib import Path
from datetime import datetime

import blake3
import msgpack
import rfc8785
from jsonschema import Draft202012Validator, FormatChecker, ValidationError, validators
from referencing import Registry, Resource
from referencing.jsonschema import DRAFT202012
from referencing.exceptions import Unresolvable

from pm_event_index_binding import binding_digest
from pm_projects_refresh_contracts import semantic_hash, scope_failures, typed_tree
from pm_event_numbers import JsonNumber, Refusal, storage_uint64


SEMANTIC_FIELDS = (
    'event_type', 'scope_kind', 'project_id', 'thread_id', 'run_id', 'node_id',
    'attempt_id', 'actor_ref', 'requested_account_ref', 'effective_account_ref',
    'occurred_at_utc', 'producer_sequence_id', 'correlation_id', 'causation_event_id',
    'parent_event_id', 'idempotency_key', 'payload_schema_id', 'payload', 'payload_ref',
    'redaction_profile', 'migration',
)
LIMIT = 16384
LEGACY_RECIPE = 'ea-do-json-v1'
CURRENT_RECIPE = 'ea-do-rfc8785-v2'
CURRENT_NUMBER_RULE = 'current_input'
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
UTC_FORMAT = FormatChecker()


@UTC_FORMAT.checks('date-time', raises=(ValueError, TypeError))
def utc(value):
    # RFC3339 UTC, preserving arbitrary decimal precision and original bytes.
    if type(value) is not str or re.fullmatch(
            r'[0-9]{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12][0-9]|3[01])T'
            r'(?:[01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9](?:\.[0-9]+)?Z', value) is None:
        return False
    datetime.fromisoformat(value[:-1] + '+00:00')
    return True


@UTC_FORMAT.checks('pm-utf8-body-16k', raises=(ValueError, TypeError, UnicodeError))
def inline_body(value):
    return type(value) is str and len(value.encode('utf-8')) <= LIMIT


def exact_pattern(validator, pattern, instance, schema):
    # Strengthen only anchored lexical guards; preserve JSON Schema search semantics
    # for unanchored redaction patterns. Also applies inside selected frozen inputs.
    if isinstance(instance, str) and pattern.startswith('^') and pattern.endswith('$'):
        if re.fullmatch(pattern, instance) is None:
            yield ValidationError('anchored identifier requires full match')
    else:
        yield from Draft202012Validator.VALIDATORS['pattern'](validator, pattern, instance, schema)


StrictValidator = validators.extend(Draft202012Validator, {'pattern': exact_pattern})


def number_domain_errors(value):
    """Current producer inputs only, never Storage metadata or typed originals.

    RFC8785 finite numbers only; integral values use safe integers, never a
    float64 alias. Fractional floats retain the original typed source domain.
    """
    if isinstance(value, dict):
        return [error for child in value.values() for error in number_domain_errors(child)]
    if isinstance(value, list):
        return [error for child in value for error in number_domain_errors(child)]
    if type(value) in (int, float):
        try:
            rfc8785.dumps(value)
            if type(value) is float and value.is_integer():
                return ['number_domain']
        except (ValueError, OverflowError):
            return ['number_domain']
    return []


def storage_sequence_valid(event):
    try:
        storage_uint64(event.get('sequence_id'))
    except Refusal:
        return False
    return True


def number_rule_for_record(case=None, *, retained=False):
    """Select the write-time rule; a caller's recipe label alone grants nothing.

    Current inputs always use the strict domain. Both supported original
    editions keep their originally valid number types. The verified adapter
    binds the edition to this exact original receipt, never to live state.
    """
    if not retained:
        return CURRENT_NUMBER_RULE, []
    state = case['historical_reader_state']
    recipe = state['original_identity_recipe']
    proof = state['original_recipe_evidence']
    expected = recipe_witness_value(case, recipe)
    errors = []
    if (recipe not in (LEGACY_RECIPE, CURRENT_RECIPE) or proof['verified'] is not True
            or proof['value'] != expected
            or proof['source_ref'] != 'writer-recipe:' + case['event']['event_id']
            or proof['source_sha256'] != hashlib.sha256(packed(expected)).hexdigest()):
        errors.append('historical_original_recipe')
    return recipe, errors


def record_number_errors(value, case=None, *, retained=False):
    rule, errors = number_rule_for_record(case, retained=retained)
    return errors or (list(dict.fromkeys(number_domain_errors(value)))
                      if rule == CURRENT_NUMBER_RULE else [])


def number_token_errors(token):
    try:
        value = json.loads(token)
        if record_number_errors(value) or rfc8785.dumps(value).decode('utf-8') != token:
            return ['number_token_canonical']
    except (ValueError, OverflowError):
        return ['number_token_canonical']
    return []


def canonical_loads(text):
    def parse(token):
        errors = number_token_errors(token)
        if errors:
            raise ValueError(errors[0] + ':' + token)
        return json.loads(token)
    return json.loads(text, parse_int=parse, parse_float=parse, parse_constant=parse)


def fixture_loads(text):
    """Decode original domains intact; check raw tokens only at current inputs.

    Retained events, Storage receipts and typed sources are observations, not
    current writer input. No recursive key-name or numeric-rewriting exemption.
    """
    class Number:
        def __init__(self, token):
            self.token = token
    current = {
        'valid_payloads': {'payload'}, 'event_cases': {'event', 'logical_payload', 'producer_context'},
        'body_cases': {'payload'}, 'board_storage_cases': {'payload', 'envelope'},
        'retry_cases': {'candidate'}, 'retry_transition_cases': {'context'},
    }
    raw = json.loads(text, parse_int=Number, parse_float=Number, parse_constant=Number)
    def decode(value, path=()):
        if isinstance(value, Number):
            is_current = (len(path) >= 3 and path[0] in current and path[2] in current[path[0]])
            storage_sequence = (len(path) == 4 and path[3] == 'sequence_id'
                and (path[0], path[2]) in (('event_cases', 'event'), ('retry_cases', 'candidate')))
            if storage_sequence:
                # Field-owner dispatch; never round-trip Storage uint64 through JCS.
                storage_uint64(JsonNumber(value.token, not any(c in value.token for c in '.eE')))
            elif is_current and number_token_errors(value.token):
                raise ValueError('number_token_canonical:' + value.token)
            return json.loads(value.token)
        if isinstance(value, dict):
            return {key: decode(child, path + (key,)) for key, child in value.items()}
        if isinstance(value, list):
            return [decode(child, path + (index,)) for index, child in enumerate(value)]
        return value
    return decode(raw)


def integer_value(value):
    """JSON integer semantics, preserving originally valid integral floats."""
    return type(value) in (int, float) and (type(value) is int or value.is_integer())


def retry_context_errors(context):
    if not isinstance(context, dict):
        return ['retry_context_type']
    expected = {key: bool for key in ('interruption_fence', 'permission_current',
        'parent_ceiling_current', 'stop_latched', 'deadline_expired', 'same_child_lineage')}
    expected.update({key: (int, float) for key in ('attempt_number', 'prior_attempt_number')})
    expected.update({key: str for key in ('retry_cause', 'prior_state', 'operation_kind')})
    return ['retry_context_type'] if (any(type(context.get(key)) not in (kind if isinstance(kind, tuple) else (kind,))
        for key, kind in expected.items()) or 'prior_terminal_reason' not in context
        or type(context['prior_terminal_reason']) not in (str, type(None))
        or any(not integer_value(context[key]) for key in ('attempt_number', 'prior_attempt_number'))) else []


REQUIRED_ORIGINAL_STAGES = (
    'original_intent', 'accepted_original_source', 'current_owner_and_stop_fence',
    'canonical_pending_or_reservation', 'owner_commit',
)


def stage_witness_value(case, name):
    source = case['source']; stage = source['stage_custody'][name]
    evidence = stage['custody_evidence'] or {}
    return dict({key: stage[key] for key in (
        'status', 'original_operation_id', 'owner_method_id', 'request_ref', 'result_ref')},
        stage=name, owner_evidence_metadata={key: evidence.get(key) for key in (
            'owner_ref', 'revision', 'generation')},
        original_input_semantic_sha256=source['original_input_semantic_sha256'],
        accepted_source_ref=source['accepted_source_ref'],
        accepted_source_sha256=source['accepted_source_sha256'], wrapper_key=case.get('wrapper_key'),
        physical_record_sha256=case.get('physical_record_sha256'))


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


def pack_type_errors(entry):
    if (not integer_value(entry['byte_size']) or type(entry['bytes_durable']) is not bool
            or type(entry['index_durable']) is not bool
            or (entry['media_type'] == 'application/msgpack' and type(entry['value']) is not dict)
            or (entry['media_type'] == 'text/plain; charset=utf-8' and type(entry['value']) is not str)):
        return ['payload_pack_types']
    return []


def pack_errors(entry, *, large=False):
    if not isinstance(entry, dict) or set(entry) != {
            'blake3_id', 'byte_size', 'media_type', 'value', 'bytes_durable', 'index_durable'}:
        return ['payload_pack_shape']
    type_errors = pack_type_errors(entry)
    if type_errors:
        return type_errors
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


def transport_type_errors(event, logical, packs):
    if (type(event) is not dict or type(logical) is not dict or type(packs) is not dict
            or type(event.get('payload')) is not dict):
        return ['payload_types']
    return []


def transport_errors(event, logical, packs, *, ingest_encoding='decoded'):
    errors = []
    type_errors = transport_type_errors(event, logical, packs)
    if type_errors:
        return type_errors
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


def phase_context_errors(context):
    if (type(context) is not dict or not integer_value(context.get('max_questions'))
            or type(context.get('completion_signal')) is not bool
            or type(context.get('phase_state')) is not str):
        return ['phase_context_type']
    return []


def predicate_errors(family, payload, context, retry_allowed):
    if family == 'phase.force_completed':
        type_errors = phase_context_errors(context)
        if type_errors:
            return type_errors
        if (context.get('phase_state') != 'active' or context.get('completion_signal') is not False
                or payload['question_count'] <= payload['max_questions'] + 1
                or context.get('max_questions') != payload['max_questions']):
            return ['phase_force_predicate']
    if family == 'subagent.output_truncated' and payload['original_length'] < payload['truncated_length']:
        return ['truncation_grows_output']
    if family == 'subagent.retried':
        joins = ('retry_cause', 'prior_attempt_number', 'attempt_number', 'child_run_id', 'parent_run_id')
        if any(payload[k] != context.get(k) for k in joins):
            return ['retry_payload_source_predicate']
        if not retry_allowed(context):
            return ['retry_current_transition']
    return []


def offline_registry(documents):
    def refuse(uri):
        raise ValueError('unselected schema URI: ' + uri)
    registry = Registry(retrieve=refuse)
    for name, schema in documents.items():
        resource = Resource.from_contents(schema, default_specification=DRAFT202012)
        registry = registry.with_resources([(schema['$id'], resource),
                ('https://puppetmaster.local/Plans/' + name + '.schema.json', resource)])
    return registry.crawl()


def reference_errors(document, selection=None, documents=None):
    """Eager offline closure, including dormant subschemas and scoped $id/anchors.

    Traverse only selected roots and every schema edge reachable from them; the
    immutable aggregate's unrelated Goal roots are not implicitly selected.
    Referencing implements URI scope, escaped JSON Pointers and anchors. Retrieval
    always refuses; neither filesystem basename nor newest-version fallback exists.
    """
    return list(_reference_errors(json.dumps(document, sort_keys=True), selection,
                                  json.dumps(documents or {}, sort_keys=True)))


@lru_cache(maxsize=256)
def _reference_errors(document_json, selection, documents_json):
    document = json.loads(document_json)
    docs = json.loads(documents_json)
    docs['selected'] = document
    registry = offline_registry(docs)
    resolver = registry.resolver(base_uri=document['$id'])
    seen, errors = set(), []
    def visit(resource, resolver, entered=False):
        if not entered:
            resolver = resolver.in_subresource(resource)
        key = (resolver._base_uri, id(resource.contents))
        if key in seen:
            return
        seen.add(key)
        value = resource.contents
        if isinstance(value, dict):
            for keyword in ('$ref', '$dynamicRef'):
                if keyword in value:
                    try:
                        target = resolver.lookup(value[keyword])
                        visit(Resource.from_contents(target.contents, default_specification=DRAFT202012),
                              target.resolver, entered=True)
                    except (Unresolvable, ValueError, KeyError) as exc:
                        errors.append('unresolved_schema_reference:' + value[keyword])
        for child in resource.subresources():
            visit(child, resolver)
    try:
        if selection:
            target = resolver.lookup(selection)
            visit(Resource.from_contents(target.contents, default_specification=DRAFT202012),
                  target.resolver, entered=True)
        else:
            visit(Resource.from_contents(document, default_specification=DRAFT202012), resolver, entered=True)
    except (Unresolvable, ValueError, KeyError):
        errors.append('unresolved_schema_reference:' + str(selection))
    return tuple(sorted(set(errors)))


@lru_cache(maxsize=4)
def selected_documents(root):
    names = ('application_workflow_contracts', 'application_workflow_sources',
             'shared_integration_runtime', 'event_record_index_checkpoint', 'event_record',
             'coordination_projection_contracts', 'application_board_message_v2',
             'orchestrator_historical_read')
    return {name: json.loads((root / 'Plans' / (name + '.schema.json')).read_text()) for name in names}


@lru_cache(maxsize=4)
def selected_validators(root, format_checker):
    documents = selected_documents(root)
    registry = offline_registry(documents)
    result = {}
    for key, name, definition in (
        ('source', 'application_workflow_sources', 'OriginalCoordinationAppendSource'),
        ('input', 'application_workflow_contracts', 'AgentMessageApplicationV1'),
        ('wrapper', 'application_workflow_contracts', 'CrewBoardMessageStorageApplicationV1'),
        ('source_v2', 'application_board_message_v2', 'OriginalCoordinationAppendSourceV2'),
        ('input_v2', 'application_board_message_v2', 'AgentMessageApplicationV2'),
        ('wrapper_v2', 'application_board_message_v2', 'CrewBoardMessageStorageApplicationV2'),
        ('historical', 'orchestrator_historical_read', None),
        ('checkpoint', 'event_record_index_checkpoint', 'checkpoint'),
        ('read_token', 'event_record_index_checkpoint', 'read_token'),
        ('event', 'event_record', None),
    ):
        pointer = '#/$defs/' + definition if definition else None
        errors = reference_errors(documents[name], pointer, documents)
        if errors:
            raise ValueError(errors)
        uri = documents[name]['$id'] + (pointer or '')
        result[key] = StrictValidator({'$ref': uri}, registry=registry, format_checker=format_checker)
    return result


def event_errors(case, schema, identity, retry_allowed, root, formats, *, historical=False):
    event, payload = case['event'], case['logical_payload']
    numeric_errors = record_number_errors([
        {k: value for k, value in event.items() if k in SEMANTIC_FIELDS},
        payload, case['producer_context']],
                                          case, retained=historical)
    if numeric_errors:
        return numeric_errors
    refs = reference_errors(schema, '#/$defs/' + case['definition'], selected_documents(root))
    if refs:
        return ['unresolved_schema_reference']
    v = selected_validators(root, formats)
    errors = ['event_schema'] if (list(v['event'].iter_errors(event))
                                  or not storage_sequence_valid(event)) else []
    if historical and event.get('replay_policy') in ('projector_replay_only', 'dedupe_by_idempotency_key'):
        pass
    elif event.get('replay_policy') == 'projector_replay_only':
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


def application_shape_errors(case, root, formats):
    """Closed original input/source/wrapper preconditions, before relational joins."""
    v = selected_validators(root, formats)
    edition = '_v2' if (case['event_type'] == 'crew.board_message_posted' or
                         case['source'].get('schema_id') == 'pm.application_source.coordination_append.v2') else ''
    errors = []
    for kind, value in [('source', case['source']), ('input', case['source'].get('original_input')),
                        ('wrapper', case['wrapper'])]:
        if list(v[kind + edition].iter_errors(value)):
            errors.append('application_' + kind + '_schema')
    return errors


def board_source_errors(case, root, formats):
    """Validate the selected closed original, not a hand-written source summary."""
    payload, source = case['payload'], case['source']
    errors = []
    if payload['scope'] != 'application':
        # Project source is the unchanged original codec behind an explicit
        # synthetic adapter; the canonical board message itself is joined below.
        shape_errors = project_original_input_errors(case, formats)
        if shape_errors:
            return shape_errors
        for k in ('scope', 'storage_instance_id', 'server_id', 'thread_id', 'crew_id', 'run_id', 'operation_id', 'project_id'):
            if source.get(k) != payload.get(k):
                errors.append('source_' + k)
        if source.get('edition') != 'original_project_coordination_source' or source.get('interface') != 'storage.coordination_append.v1@1.0.0':
            errors.append('source_edition')
        message = source.get('original_input', {})
        if source.get('message_ids') != payload.get('message_ids', [payload.get('message_id')]):
            errors.append('message_source')
    else:
        edition = '_v2' if (case['event_type'] == 'crew.board_message_posted' or
                         case['source'].get('schema_id') == 'pm.application_source.coordination_append.v2') else ''
        wrapper = case['wrapper']
        errors += application_shape_errors(case, root, formats)
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
                or typed_tree(wrapper['record']) != typed_tree(message)):
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
            if stage['owner_method_id'] != source['interface_id']:
                errors.append('source_stage_method')
        witness = case.get('accepted_source_witness', {})
        if (witness.get('ref') != source['accepted_source_ref']
                or typed_tree(witness.get('value')) != typed_tree(message)
                or source['accepted_source_sha256'] != semantic_hash('accepted_source', witness.get('value'))):
            errors.append('accepted_original_source_join')
        if case.get('physical_record_sha256') != hashlib.sha256(packed(wrapper)).hexdigest():
            errors.append('wrapper_physical_digest')
        for name in REQUIRED_ORIGINAL_STAGES:
            stage = source['stage_custody'][name]
            if stage['status'] != 'accepted':
                errors.append('source_stage_status')
            proof = stage['custody_evidence']
            witness = case.get('stage_evidence_witnesses', {}).get(name, {})
            if (proof is None or stage['request_ref'] is None or stage['result_ref'] is None
                    or witness.get('ref') != (proof or {}).get('source_ref')
                    or typed_tree(witness.get('value')) != typed_tree(stage_witness_value(case, name))
                    or (proof or {}).get('source_sha256') != semantic_hash('accepted_source', witness.get('value'))):
                errors.append('source_stage_evidence')
        for k in ('thread_id', 'crew_id', 'run_id'):
            if message[k] != payload[k]:
                errors.append('message_' + k)
        ids = payload.get('message_ids', [payload.get('message_id')])
        if ids != [message['message_id']]:
            errors.append('message_source')
        prefix = 'crew_board_message.application.' + ('v2:' if edition else 'v1:')
        key = prefix + ':'.join(value.encode().hex() for value in (
            wrapper['storage_instance_id'], wrapper['server_id'], message['thread_id'],
            message['crew_id'], message['run_id'], message['message_id']))
        if case['wrapper_key'] != key:
            errors.append('wrapper_key_join')
    if case['event_type'] == 'crew.board_message_posted':
        if payload['scope'] == 'application':
            for k in ('subject', 'priority'):
                if message[k] != payload[k]:
                    errors.append('message_' + k)
            if message['receiver_agent_type'] != payload.get('to_agent_type'):
                errors.append('message_target_type')
        else:
            for k in ('message_id', 'from_agent_id', 'subject', 'priority', 'to_agent_id', 'to_agent_type'):
                if message.get(k) != payload.get(k):
                    errors.append('message_' + k)
        if payload['scope'] == 'application':
            if message['sender_agent_id'] != payload['from_agent_id']:
                errors.append('message_sender')
            if message['receiver_agent_id'] != payload.get('to_agent_id'):
                errors.append('message_target')
            if (message['inline_text'] != payload.get('content')
                    or message['blake3_payload_ref'] != payload.get('content_ref', {}).get('blake3_id')):
                errors.append('message_content_join')
        elif (message.get('content') != payload.get('content')
              or message.get('content_ref') != payload.get('content_ref')):
            errors.append('message_content_join')
    return errors


def project_original_input_errors(case, formats):
    """Validate the unchanged Project adapter before reading any joined value.

    OSI-247/299/301 supply the types/enums. This adapter's context names are
    files/operations/sender_node/related_message_ids; no original is rewritten.
    JSON integer semantics on reference sizes retain valid original floats.
    """
    source = case['source']
    message = source.get('original_input') if type(source) is dict else None
    if (type(source) is not dict or set(source) != PROJECT_SOURCE_FIELDS
            or type(message) is not dict or set(message) != PROJECT_MESSAGE_FIELDS):
        return ['project_original_input_shape']
    types = {key: str for key in PROJECT_MESSAGE_FIELDS}
    types.update({key: (str, type(None)) for key in (
        'to_agent_id', 'to_agent_type', 'to_node_id', 'to_lane_id', 'thread_id',
        'in_reply_to', 'content')})
    types.update(content_ref=(dict, type(None)), context=dict, read_by=list, resolved=bool)
    if (any(type(source[key]) is not str for key in PROJECT_SOURCE_FIELDS - {'original_input', 'message_ids'})
            or type(source['message_ids']) is not list
            or any(type(item) is not str for item in source['message_ids'])
            or any(type(message[key]) not in (kind if type(kind) is tuple else (kind,))
                   for key, kind in types.items())
            or any(type(item) is not str for item in message['read_by'])):
        return ['project_original_input_type']
    context = message['context']
    if (set(context) != {'files', 'operations', 'sender_node', 'related_message_ids'}
            or type(context['sender_node']) not in (str, type(None))
            or any(type(context[key]) is not list or any(type(item) is not str for item in context[key])
                   for key in ('files', 'operations', 'related_message_ids'))):
        return ['project_original_input_type']
    ref = message['content_ref']
    if ref is not None and (set(ref) != {'blake3_id', 'byte_size', 'media_type'}
            or type(ref['blake3_id']) is not str or type(ref['media_type']) is not str
            or not integer_value(ref['byte_size'])):
        return ['project_original_input_type']
    if (message['message_type'] not in ('Question', 'Answer', 'Update', 'Request', 'Decision', 'Warning', 'Announcement')
            or message['priority'] not in ('low', 'normal', 'high', 'urgent')
            or source['message_schema'] != 'original_project_agent_message'
            or not formats.conforms(message['created_at'], 'date-time')
            or (message['content'] is None) == (ref is None)
            or (message['content'] is not None and not inline_body(message['content']))
            or (ref is not None and (re.fullmatch(r'blake3:[0-9a-f]{64}', ref['blake3_id']) is None
                or ref['byte_size'] <= LIMIT or ref['media_type'] != 'text/plain; charset=utf-8'))):
        return ['project_original_input_value']
    return []


def successor_errors(root):
    """Pin the whole live successor selection without rewriting frozen graphs."""
    doc = json.loads((root / 'Plans/application_board_message_v2.schema.json').read_text())
    graph = json.loads((root / 'Plans/application_board_message_v2_graph.json').read_text())
    errors = reference_errors(doc, documents=selected_documents(root))
    if graph['graph_sha256'] != semantic_hash('source_graph', {k:v for k,v in graph.items() if k != 'graph_sha256'}):
        errors.append('successor_graph_digest')
    expected_resources = {'Plans/' + name + '.schema.json': selected_documents(root)[name]['$id']
        for name in ('application_board_message_v2', 'application_workflow_contracts',
                     'shared_integration_runtime', 'coordination_projection_contracts')}
    if ({x['path']: x['schema_uri'] for x in graph['resources']} != expected_resources
            or len(graph['resources']) != len(expected_resources)
            or any(x['sha256'] != hashlib.sha256((root / x['path']).read_bytes()).hexdigest()
                   for x in graph['resources'])):
        errors.append('successor_resource_selection')
    method = graph['methods'][0]
    expected_method = {'interface_id': 'storage.coordination_append.application@2.0.0',
        'owner_doc': 'Plans/Contracts_V0.md#CV-740',
        'source_root_ref': 'Plans/application_board_message_v2.schema.json#/$defs/OriginalCoordinationAppendSourceV2',
        'input_root_ref': 'Plans/application_board_message_v2.schema.json#/$defs/AgentMessageApplicationV2',
        'output_root_ref': 'Plans/application_workflow_contracts.schema.json#/$defs/CoordinationProjectionApplicationV1',
        'current_or_retained_role': 'original_current_and_retained_exact'}
    if method != expected_method or len(graph['methods']) != 1:
        errors.append('successor_method_selection')
    g = graph['graphs'][0]
    stages = list(doc['$defs']['OriginalCoordinationAppendSourceV2']['properties']['stage_custody']['properties'])
    expected_edges = [{'from_role': a, 'to_role': b, 'interface_id': expected_method['interface_id'],
        'input_root_ref': expected_method['input_root_ref'], 'output_root_ref': expected_method['output_root_ref']}
        for a,b in zip(stages, stages[1:])]
    if (g['graph_id'] != 'app.coordination_append.v2' or g['ordered_role_edges'] != expected_edges
            or g['participating_method_ids'] != [expected_method['interface_id']]
            or g['physical_family_ids'] != ['crew_board_message_application_v2']
            or g['event_selectors'] != ['crew.board_message_posted@1.0.0', 'crew.board_message_read@1.0.0', 'crew.board_messages_archived@1.0.0']
            or g['reader_ids'] != ['reader.orchestrator.crew_board_message_posted.history.v1@1.0.0']):
        errors.append('successor_complete_graph')
    physical = graph['physical_selection']
    if (physical['wrapper_root_ref'] != 'Plans/application_board_message_v2.schema.json#/$defs/CrewBoardMessageStorageApplicationV2'
            or physical['codec_id'] != 'pm.crew_board_message.application.physical_messagepack.v2'
            or physical['codec_algorithm'] != 'pm.application.physical_messagepack.v1'
            or physical['key_prefix'] != 'crew_board_message.application.v2'):
        errors.append('successor_physical_selection')
    rb = graph['read_backup_restore']
    if any(rb[k] != value for k,value in {
        'canonical_reader_id':'storage.crew_board_message.read.application@2.0.0',
        'backup_method_id':'storage.crew_board_message.backup.application@2.0.0',
        'restore_method_id':'storage.crew_board_message.restore.application@2.0.0',
        'wrapper_root_ref':physical['wrapper_root_ref'], 'source_root_ref':method['source_root_ref'],
        'owner_ref':'Plans/storage-plan.md#SP-723', 'backup_owner_ref':'Plans/Backup_Restore_System.md#BRS-033',
        'same_source_access_deletion_hold_fences':True}.items()):
        errors.append('successor_read_backup_restore')
    storage = json.loads((root / 'Plans/storage_value_registry.json').read_text())
    rows = [x for x in storage['families'] if x['family_id'] == 'crew_board_message_application_v2']
    if len(rows) != 1:
        return errors + ['successor_storage_member']
    row = rows[0]
    if (row['value_schema'] != doc['$defs']['CrewBoardMessageStorageApplicationV2']
            or row['schema_version'] != '2.0.0' or row['value_schema_id'] != 'pm.storage_value.crew_board_message.application.v2'
            or row['value_schema_ref'] != physical['wrapper_root_ref']
            or storage['storage_profile']['family_profiles'].get('crew_board_message_application_v2') != {
                'redb_file':'canonical', 'storage_group':'coordination_and_storage',
                'encoding_target':'messagepack_canonical',
                'encoding_note':'SP-723 governed V2 wrapper uses CV-366 deterministic MessagePack algorithm; frozen V1 remains exact.',
                'max_value_bytes':16384}
            or row['key_shape'] != physical['key_prefix'] + ':{hex(storage_instance_id)}:{hex(server_id)}:{hex(thread_id)}:{hex(crew_id)}:{hex(run_id)}:{hex(message_id)}'):
        errors.append('successor_storage_selection')
    return errors


@lru_cache(maxsize=1)
def retry_schemas():
    plans = Path(__file__).resolve().parents[1] / 'Plans'
    event = StrictValidator(json.loads((plans / 'event_record.schema.json').read_text()), format_checker=UTC_FORMAT)
    payloads = json.loads((plans / 'orchestrator_event_payloads.schema.json').read_text())
    return event, {name: StrictValidator(value, format_checker=UTC_FORMAT) for name, value in payloads['$defs'].items()}


def retry_shape_valid(event):
    envelope, payloads = retry_schemas()
    if not envelope.is_valid(event) or not storage_sequence_valid(event):
        return False
    definition = event['event_type'].replace('.', '_')
    return (definition in payloads and (event['payload_ref'] is not None
            or payloads[definition].is_valid(event['payload'])))


def retry_outcome(original, candidate):
    if record_number_errors({k: value for k, value in candidate.items() if k in SEMANTIC_FIELDS}):
        return {'status': 'number_domain', 'appended': False, 'receipt': None}
    if not retry_shape_valid(original) or not retry_shape_valid(candidate):
        return {'status': 'retry_value_schema', 'appended': False, 'receipt': None}
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


def historical_read_errors(case, schema, owner_module):
    root, formats = owner_module.ROOT, owner_module.UTC_FORMAT
    state = case.get('historical_reader_state')
    validators = selected_validators(root, formats)
    if not validators['historical'].is_valid(state):
        return ['historical_state_schema']
    recipe, recipe_errors = number_rule_for_record(case, retained=True)
    if recipe_errors:
        return recipe_errors
    errors = checkpoint_errors(case, root, formats)
    family, payload, event = case['event_type'], case['logical_payload'], case['event']
    expected_reader = 'reader.orchestrator.' + family.replace('.', '_') + '.history.v1@1.0.0'
    if state['event_type'] != family or state['reader_id'] != expected_reader:
        errors.append('historical_reader_identity')
    if state['reader_status'] == 'withdrawn' or state['publication_state'] != 'published':
        errors.append('historical_reader_withdrawn')
    if state['supported_payload_schema'] != event['payload_schema_id']:
        errors.append('historical_schema_unsupported')
    admission = state['original_admission']
    expected = {'event_type': family, 'family_revision': payload['schema_version'],
                'payload_schema_id': event['payload_schema_id'], 'event_id': event['event_id'],
                'scope_partition': case['scope_partition'], 'storage_instance_id': payload['storage_instance_id']}
    if not admission['admitted_when_written'] or any(admission[k] != value for k, value in expected.items()):
        errors.append('historical_original_admission')
    if (state['original_source_sha256'] != hashlib.sha256(packed(event)).hexdigest()
            or state['original_source_ref'] != 'seglog:' + event['event_id']
            or not state['original_source_verified']):
        errors.append('historical_original_source')
    # Only captured original facts enter original-event validation. Current live
    # child/phase/model/board/Stop/deadline/permission state cannot recapture them.
    original = copy.deepcopy(case)
    original['producer_context'] = state['original_producer_context']
    selected_identity = lambda family, payload: owner_module.historical_identity(family, payload, recipe)
    errors += event_errors(original, schema, selected_identity, owner_module.retry_allowed,
                           root, formats, historical=True)
    if not state['current_access_allowed'] or state['source_deleted'] or not state['hold_allows_disclosure']:
        errors.append('historical_disclosure_fence')
    return errors


def recover_original(case, schema, owner_module, candidate=None):
    """Resolve verified original bytes before a retry; never remint an old ID."""
    if historical_read_errors(case, schema, owner_module):
        return {'status': 'historical_original_unverified', 'appended': False, 'receipt': None}
    if candidate is not None:
        return retry_outcome(case['event'], candidate)
    return {'status': 'original_result', 'appended': False, 'receipt': copy.deepcopy(case['event'])}


def checkpoint_errors(case, root, formats):
    _, recipe_errors = number_rule_for_record(case, retained=True)
    if recipe_errors:
        return recipe_errors
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


def failure_oracle_errors(test):
    return [] if type(test.get('expected_exit_code')) is int and test['expected_exit_code'] == 1 else ['failure_oracle_success_code']


def refresh_stage_witnesses(case):
    """Synchronize dependent observations in synthetic single-defect controls."""
    source = case['source']
    for name, witness in case.get('stage_evidence_witnesses', {}).items():
        witness['value'] = stage_witness_value(case, name)
        proof = source['stage_custody'][name]['custody_evidence']
        if proof is not None:
            proof['source_sha256'] = semantic_hash('accepted_source', witness['value'])
    source['source_sha256'] = semantic_hash('accepted_source', {
        key: value for key, value in source.items() if key != 'source_sha256'})


def custody_case(base, test):
    case = numeric_board_original_case(base) if test.get('original_integral_float') else copy.deepcopy(base)
    target = case
    for field in test['path'][:-1]:
        target = target[field]
    if test.get('remove'):
        target.pop(test['path'][-1])
    else:
        value = copy.deepcopy(test['value'])
        if test.get('opposite_primitive_type'):
            original = target[test['path'][-1]]
            assert type(original) in (int, float)
            value = float(original) if type(original) is int else int(original)
        target[test['path'][-1]] = value
    if test.get('sync_physical_record'):
        case['physical_record_sha256'] = hashlib.sha256(packed(case['wrapper'])).hexdigest()
    if test.get('sync_stage_witnesses'):
        refresh_stage_witnesses(case)
    else:
        source = case['source']
        source['source_sha256'] = semantic_hash('accepted_source', {
            key: value for key, value in source.items() if key != 'source_sha256'})
    return case


def numeric_board_original_case(base):
    """An originally valid retained typed source is never a current input."""
    case = copy.deepcopy(base)
    source = case['source']; source['original_input']['source_sequence'] = 1.0
    case['wrapper']['record'] = copy.deepcopy(source['original_input'])
    source['original_input_semantic_sha256'] = semantic_hash('accepted_source', source['original_input'])
    source['accepted_source_sha256'] = source['original_input_semantic_sha256']
    case['accepted_source_witness']['value'] = copy.deepcopy(source['original_input'])
    case['physical_record_sha256'] = hashlib.sha256(packed(case['wrapper'])).hexdigest()
    refresh_stage_witnesses(case)
    return case


def recipe_witness_value(case, recipe):
    event = case['event']
    return {'identity_recipe': recipe, 'event_type': case['event_type'],
            'event_id': event['event_id'], 'idempotency_key': event['idempotency_key'],
            'payload_schema_id': event['payload_schema_id'], 'scope_partition': case['scope_partition'],
            'storage_instance_id': case['logical_payload']['storage_instance_id'],
            'original_source_sha256': hashlib.sha256(packed(event)).hexdigest()}


def record_recipe(case, recipe):
    """Synthetic verified adapter observation; never native authentication."""
    state = case['historical_reader_state']
    state['original_identity_recipe'] = recipe
    value = recipe_witness_value(case, recipe)
    state['original_recipe_evidence'] = {'source_ref': 'writer-recipe:' + case['event']['event_id'],
        'source_sha256': hashlib.sha256(packed(value)).hexdigest(), 'verified': True, 'value': value}


def recapture_history(case):
    """Refresh copied Storage observations after changing a synthetic original."""
    event = case['event']; read = case['read']; row = read['row']
    node = read['checkpoint']['generations'][read['checkpoint']['current_generation_id']]
    frontier = node['frontier']
    case['producer_semantic_digest'] = semantic_digest(event)
    row.update(event_id=event['event_id'], idempotency_key=event['idempotency_key'],
               producer_semantic_digest=semantic_digest(event))
    read['row_key'] = f"event_record_index.v2:{case['scope_partition']}:{event['sequence_id']:020}:{event['event_id']}"
    read['source_event'] = copy.deepcopy(event)
    read['source_value_sha256'] = hashlib.sha256(packed(event)).hexdigest()
    prefix = binding_digest({'domain': 'pm.event_index.retained_prefix.v1', 'entries': [{
        'sequence_id': event['sequence_id'], 'event_id': event['event_id'],
        'scope_partition': case['scope_partition'], 'source_value_sha256': read['source_value_sha256']}]})
    node['anchor']['retained_event_prefix_sha256'] = frontier['coverage']['retained_event_prefix_sha256'] = prefix
    node['anchor']['source_selection']['manifest_survivor_prefix_sha256'] = prefix
    frontier['source_selection']['manifest_survivor_prefix_sha256'] = prefix
    row['publication_locator']['survivor_prefix_sha256'] = prefix
    frontier['coverage']['last_frame']['last_event_id'] = event['event_id']
    read['current_source_selection'] = copy.deepcopy(frontier['source_selection'])
    read['read_token']['source_selection'] = copy.deepcopy(frontier['source_selection'])
    frontier['index_row_set_sha256'] = binding_digest({'domain': 'pm.event_index.row_set.v1', 'entries': [
        {'key': read['row_key'], 'value': row}]})
    read['read_token']['generation_anchor_sha256'] = binding_digest(node['anchor'])
    read['read_token']['frontier_sha256'] = binding_digest(frontier)
    state = case['historical_reader_state']
    state['original_source_sha256'] = read['source_value_sha256']
    state['original_source_ref'] = 'seglog:' + event['event_id']
    state['original_admission']['event_id'] = event['event_id']
    record_recipe(case, state['original_identity_recipe'])
    return case


def numeric_history_case(base, token, owner_module=None, recipe=CURRENT_RECIPE):
    """Build a retained original with the actual writing recipe and exact bytes."""
    case = copy.deepcopy(base)
    case['logical_payload']['occurrence'] = json.loads(token)
    event = case['event']; event['payload'] = copy.deepcopy(case['logical_payload'])
    if owner_module is not None:
        event['idempotency_key'], event['event_id'] = owner_module.historical_identity(
            case['event_type'], case['logical_payload'], recipe)
    case['historical_reader_state']['original_identity_recipe'] = recipe
    return recapture_history(case)


def check_oracles(fixtures, schema, owner_module):
    root, formats = owner_module.ROOT, owner_module.UTC_FORMAT
    checks = 0
    assert not reference_errors(schema, documents=selected_documents(root)), 'unresolved_schema_reference'
    cases = fixtures['event_cases']
    assert len(cases) == len(fixtures['valid_payloads'])
    for case, source in zip(cases, fixtures['valid_payloads']):
        assert case['logical_payload'] == source['payload'], ('event_payload_source_join', case['case_id'])
        assert case['event_type'] == source['event_type'] and case['definition'] == source['definition']
        assert case['scope_partition'] == source['identity']['scope_partition']
        errors = event_errors(case, schema, owner_module.identity, owner_module.retry_allowed, root, formats)
        assert not errors, (case['case_id'], errors)
        errors = historical_read_errors(case, schema, owner_module)
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
                assert retry_outcome(original, candidate)['status'] == (
                    'idempotency_conflict' if retry_shape_valid(candidate) else 'retry_value_schema'), field
            checks += 1
        checks += 6
    by_id = {c['case_id']: c for c in cases}
    assert len(by_id) == len(cases)
    for test in fixtures['storage_sequence_cases']:
        base = by_id[test['case_id']]
        bad = copy.deepcopy(base)
        bad['event']['sequence_id'] = test['value']
        assert event_errors(bad, schema, owner_module.identity, owner_module.retry_allowed,
                            root, formats) == test['expected_errors'], test['name']
        result = retry_outcome(base['event'], bad['event'])
        assert result['status'] == test['expected_status'] and result['appended'] is False, test['name']
        assert packed(result['receipt']) == packed(base['event'] if test['valid'] else None)
        assert semantic_digest(bad['event']) == semantic_digest(base['event'])
        # Exercise the actual file decoder at both current EventRecord roots.
        raw = json.dumps({'event_cases': [{'event': bad['event']}],
                          'retry_cases': [{'candidate': bad['event']}]})
        try:
            decoded = fixture_loads(raw)
        except ValueError:
            assert not test['valid'], test['name']
        else:
            candidate = decoded['retry_cases'][0]['candidate']
            assert retry_outcome(base['event'], candidate)['status'] == test['expected_status']
            if test['valid']:
                assert type(candidate['sequence_id']) is int
                assert packed(candidate) == packed(bad['event'])
                assert msgpack.unpackb(packed(candidate), raw=False)['sequence_id'] == test['value']
        assert not failure_oracle_errors(test)
        checks += 6
    for test in fixtures['number_cases']:
        base = by_id[test['case_id']]
        token = test['token']
        try:
            canonical_loads('{"occurrence":' + token + '}')
        except ValueError:
            pass
        else:
            raise AssertionError(('accepted_noncanonical_number', test['name']))
        checks += 1
        if token in ('1.0', '1e0'):
            bad = copy.deepcopy(base)
            bad['logical_payload']['occurrence'] = json.loads(token)
            bad['event']['payload'] = copy.deepcopy(bad['logical_payload'])
            assert owner_module.identity(base['event_type'], bad['logical_payload']) == owner_module.identity(base['event_type'], base['logical_payload'])
            assert event_errors(bad, schema, owner_module.identity, owner_module.retry_allowed,
                                root, formats) == ['number_domain'], test['name']
            assert retry_outcome(base['event'], bad['event']) == {
                'status': 'number_domain', 'appended': False, 'receipt': None}, test['name']
            assert semantic_digest(base['event']) == semantic_digest(bad['event'])
            retained = numeric_history_case(base, token)
            assert not historical_read_errors(retained, schema, owner_module), test['name']
            retry = retry_outcome(retained['event'], base['event'])
            assert retry['status'] == 'original_result' and retry['appended'] is False
            assert packed(retry['receipt']) == packed(retained['event']), test['name']
            checks += 7
    assert {(test['case_id'], test['token']) for test in fixtures['number_cases']} == {
        (case['case_id'], token) for case in cases for token in ('1.0', '-0', '1e0', '01')}
    for base in fixtures['board_storage_cases']:
        if base['payload']['scope'] == 'application':
            assert not owner_module.board_join_errors(numeric_board_original_case(base))
            checks += 1
    # File-backed retained vectors exercise the loader before historical dispatch.
    retained = {case['case_id']: case for case in fixtures['retained_event_cases']}
    assert {case['event_type'] for case in retained.values()} == {c['event_type'] for c in cases}
    for case in retained.values():
        assert not historical_read_errors(case, schema, owner_module), case['case_id']
        resolved = recover_original(case, schema, owner_module)
        assert resolved['status'] == 'original_result' and resolved['appended'] is False
        assert packed(resolved['receipt']) == packed(case['event']), case['case_id']
        checks += 3
    for test in fixtures['retained_retries']:
        case = retained[test['case_id']]
        result = recover_original(case, schema, owner_module, test['candidate'])
        assert result == {'status': 'original_result', 'appended': False, 'receipt': case['event']}, test['case_id']
        assert packed(result['receipt']) == packed(case['event'])
        checks += 2
    for test in fixtures['retained_history_negatives']:
        case = test['case']
        assert historical_read_errors(case, schema, owner_module) == [test['expected_error']], case['case_id']
        assert recover_original(case, schema, owner_module) == {
            'status': 'historical_original_unverified', 'appended': False, 'receipt': None}, case['case_id']
        assert not failure_oracle_errors(test)
        checks += 3
    for test in fixtures['compatibility_history_negatives']:
        assert historical_read_errors(test['case'], schema, owner_module) == [test['expected_error']], test['name']
        assert recover_original(test['case'], schema, owner_module)['status'] == 'historical_original_unverified'
        assert not failure_oracle_errors(test)
        checks += 3
    for case in fixtures['retained_board_cases']:
        assert not owner_module.board_join_errors(case)
        checks += 1
    for test in fixtures['type_cases']:
        base = by_id[test['case_id']]; payload = copy.deepcopy(base['logical_payload'])
        payload[test['field']] = copy.deepcopy(test['value'])
        assert not StrictValidator(schema['$defs'][base['definition']], format_checker=formats).is_valid(payload), test
        assert not failure_oracle_errors(test)
        checks += 2
    for test in fixtures['type_boundary_cases']:
        domain = test['domain']
        value = copy.deepcopy(test['value'])
        if domain == 'pack':
            entry = pack_entry({'large': 'x' * 17000}); entry[test['field']] = value
            errors = pack_errors(entry, large=True)
        elif domain == 'transport':
            base = by_id[test['case_id']]; event = copy.deepcopy(base['event'])
            event['payload'] = value
            errors = transport_errors(event, value, {})
        elif domain == 'retry':
            event = copy.deepcopy(by_id[test['case_id']]['event']); event[test['field']] = value
            errors = [retry_outcome(event, event)['status']]
        elif domain == 'history':
            base = copy.deepcopy(by_id[test['case_id']])
            base['historical_reader_state'][test['field']] = value
            errors = historical_read_errors(base, schema, owner_module)
        else:
            errors = failure_oracle_errors({'expected_exit_code': value})
        assert errors == [test['expected_error']], test
        assert not failure_oracle_errors(test)
        checks += 2
    for test in fixtures['context_type_cases']:
        if test['domain'] == 'retry':
            assert retry_context_errors(test['context']) == ['retry_context_type']
            assert owner_module.retry_allowed(test['context']) is False
        else:
            base = by_id[test['case_id']]
            assert predicate_errors(base['event_type'], base['logical_payload'], test['context'],
                                    owner_module.retry_allowed) == ['phase_context_type']
        checks += 2
    for test in fixtures['board_custody_cases']:
        base = fixtures['board_storage_cases'][test['board_index']]
        bad = custody_case(base, test)
        assert owner_module.board_join_errors(bad) == [test['expected_error']], (
            test['name'], owner_module.board_join_errors(bad))
        assert not failure_oracle_errors(test)
        checks += 2
    for test in fixtures['project_source_cases']:
        assert test['boundary'] == 'project_original_input_adapter'
        # A standalone adapter input has no append payload or other observers.
        bad = {'source': copy.deepcopy(fixtures['board_storage_cases'][test['board_index']]['source'])}
        target = bad
        for key in test['path'][:-1]:
            target = target[key]
        target[test['path'][-1]] = copy.deepcopy(test['value'])
        assert project_original_input_errors(bad, formats) == [test['expected_error']], test['name']
        assert not failure_oracle_errors(test)
        checks += 2
    for test in fixtures['project_source_join_cases']:
        bad = copy.deepcopy(fixtures['board_storage_cases'][test['board_index']])
        bad['source']['original_input'][test['field']] = test['value']
        assert not project_original_input_errors(bad, formats), test['name']
        assert owner_module.board_join_errors(bad) == [test['expected_error']], test['name']
        assert not failure_oracle_errors(test)
        checks += 3
    for test in fixtures['format_cases']:
        base = by_id[test['case_id']]
        payload = copy.deepcopy(base['logical_payload'])
        payload[test['field']] = test['value']
        assert StrictValidator(schema['$defs'][base['definition']], format_checker=formats).is_valid(payload) == test['valid'], test['name']
        event = copy.deepcopy(base['event'])
        event['payload'] = payload
        assert retry_shape_valid(event) == test['valid'], test['name']
        checks += 2
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
        assert {c['standing_check'] for c in tests} == set(range(1, 11)), family['event_type']
        for test in tests:
            base = by_id[test['case_id']]
            assert base['event_type'] == family['event_type']
            assert not failure_oracle_errors(test), ('failure_oracle_success_code', test['name'])
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
            elif kind in ('unresolved_resource', 'unresolved_fragment'):
                broken = copy.deepcopy(schema)
                target = ('https://puppetmaster.local/schemas/DO-MISSING/schema.json' if kind == 'unresolved_resource'
                          else '#/$defs/DO_MISSING')
                broken['$defs'][base['definition']]['properties']['unvisited_optional_ref'] = {'$ref': target}
                errors = event_errors(base, broken, owner_module.identity, owner_module.retry_allowed, root, formats)
            elif kind == 'withdrawn_reader':
                bad['historical_reader_state']['publication_state'] = 'fenced'
                errors = historical_read_errors(bad, schema, owner_module)
            elif kind == 'missing_required':
                bad['event'].pop('schema_id')
                errors = event_errors(bad, schema, owner_module.identity, owner_module.retry_allowed, root, formats)
            else:
                raise AssertionError(('unknown_negative_mutation', kind))
            assert test['expected_error'] in errors, (test['name'], errors)
            checks += 2
    for case in fixtures['compatibility_event_cases']:
        assert case['historical_reader_state']['reader_status'] == 'compatibility'
        assert case['event']['replay_policy'] == 'projector_replay_only'
        assert not historical_read_errors(case, schema, owner_module), case['case_id']
        # The retained positive keeps its original numeric bytes/recipe. A
        # current-write refusal must have exactly one defect: replay policy.
        current = copy.deepcopy(next(c for c in cases if c['event_type'] == case['event_type']
            and c['scope_partition'] == case['scope_partition']))
        current['event']['replay_policy'] = 'projector_replay_only'
        assert event_errors(current, schema, owner_module.identity,
            owner_module.retry_allowed, root, formats) == ['replay_only_not_appendable']
        assert retry_outcome(current['event'], current['event'])['status'] == 'replay_only_not_appendable'
        checks += 3
    assert {x['event_type'] for x in fixtures['compatibility_event_cases']} == {x['event_type'] for x in fixtures['contracts']}
    for test in fixtures['board_successor_cases']:
        actual = owner_module.board_join_errors(test['case'])
        assert test['expected_error'] in actual and not failure_oracle_errors(test), (test['name'], actual)
        checks += 1
    for test in fixtures['historical_cases']:
        bad = copy.deepcopy(by_id[test['case_id']])
        for key, value in test['state_changes'].items():
            bad['historical_reader_state'][key] = copy.deepcopy(value)
        if 'current_producer_state' in test:
            bad['producer_context'] = copy.deepcopy(test['current_producer_state'])
        actual = historical_read_errors(bad, schema, owner_module)
        assert (not actual) == test['valid'], (test['name'], actual)
        if not test['valid']:
            assert test['expected_error'] in actual and not failure_oracle_errors(test), (test['name'], actual)
        checks += 1
    for contract in fixtures['contracts']:
        selected = [x for x in fixtures['historical_cases'] if x['event_type'] == contract['event_type']]
        assert {'changed_live_state', 'compatibility_reader', 'forged_source', 'unproven_admission',
                'foreign_admission', 'withdrawn', 'publication_fenced', 'access_denied', 'deleted', 'held_hidden'} <= {x['kind'] for x in selected}
        checks += 1
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
