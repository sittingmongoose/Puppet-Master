"""DO append/retry/transport/read relational oracles. Native authority NOT_RUN.

Fixtures assume a verified source adapter and an admitted generic publication.
They test joins, not native CRC, custody authentication, redb CAS or durability.
"""
import base64
import copy
import hashlib
import json
import re
import sys
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


def member_payload_schema_id(definition, version):
    """The envelope's payload_schema_id, from the selected definition.

    SP-320 board members carry no stored schema_id, so this never reads one from
    the payload; for the other families their schema's const pins the same name.
    """
    return f'pm.event_payload.{definition}.v1@{version}'


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
                'payload_schema_id': member_payload_schema_id(case['definition'], payload['schema_version'])}
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


# The definitions the V2 graph reaches in the two shared aggregates, and their content digests.
# Main edits other definitions in these files, so the graph's whole-file pins can need a refresh; these
# digests must stay fixed across such a refresh. Every board source carries original_output null, so no
# fixture value visits the output root or the two definitions only it reaches: only this guard sees them.
SELECTED_SHARED_DEFINITIONS = {
    'application_workflow_contracts': {
        'names': ('AgentMessageApplicationV1', 'CoordinationProjectionApplicationV1', 'CrewBoardMessageStorageApplicationV1'),
        'sha256': 'e6c9cdf3f042c1ef877b348402b9c55676eb43390ee4978cabd0c7895d2ca880'},
    'shared_integration_runtime': {
        'names': ('OwnerEvidenceRefV1', 'WorkflowCommandContextV1', 'WorkflowRootRefV1', 'WorkflowScopeV2'),
        'sha256': 'e61828e2206f7e72fde1c716882d8ba40160ce1ce7065c70b64d26b383a1c48c'},
}


def selected_definition_errors(documents):
    """Refuse a change to a selected shared definition, whatever the whole-file pin says."""
    for name, selection in SELECTED_SHARED_DEFINITIONS.items():
        selected = {x: documents[name].get('$defs', {}).get(x) for x in selection['names']}
        encoded = json.dumps(selected, sort_keys=True, separators=(',', ':'), ensure_ascii=False).encode()
        if hashlib.sha256(encoded).hexdigest() != selection['sha256']:
            return ['successor_selected_definitions']
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
    errors.extend(selected_definition_errors(selected_documents(root)))
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
    # DO-P1F06: every comparison below is by exact type (typed_tree), so 1.0, "1" or true is never 1, and each
    # copy is compared with its source, never with another copy of it.
    if typed_tree(cp['storage_instance_id']) != typed_tree(storage_id):
        errors.append('checkpoint_storage_identity')
    if typed_tree(token['storage_instance_id']) != typed_tree(storage_id):
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
    if typed_tree(token) != typed_tree(expected):
        errors.append('checkpoint_read_token_join')
    if typed_tree(read['current_source_selection']) != typed_tree(frontier['source_selection']):
        errors.append('checkpoint_read_token_join')
    for selection in (node['anchor']['source_selection'], frontier['source_selection']):
        if typed_tree(selection['storage_instance_id']) != typed_tree(storage_id):
            errors.append('checkpoint_source_storage_identity')
    errors += row_event_copy_errors(case, row)
    row_key = f"event_record_index.v2:{case['scope_partition']}:{event['sequence_id']:020}:{event['event_id']}"
    if typed_tree(read['row_key']) != typed_tree(row_key):
        errors.append('index_row_locator_join')
    if typed_tree(row['publication_locator']['checkpoint_ref']) != typed_tree(expected['checkpoint_ref']):
        errors.append('index_row_locator_join')
    source_value_sha256 = hashlib.sha256(packed(event)).hexdigest()
    if typed_tree(read['source_event']) != typed_tree(event):
        errors.append('index_original_source_join')
    if typed_tree(read['source_value_sha256']) != typed_tree(source_value_sha256):
        errors.append('index_original_source_join')
    row_schema = index_row_schema(root)
    if list(StrictValidator(row_schema, format_checker=formats).iter_errors(row)):
        errors.append('index_row_schema')
    expected_set = binding_digest({'domain': 'pm.event_index.row_set.v1',
                                  'entries': [{'key': read['row_key'], 'value': row}]})
    if typed_tree(frontier['index_row_count']) != typed_tree(1):
        errors.append('index_complete_row_set')
    if typed_tree(frontier['index_row_set_sha256']) != typed_tree(expected_set):
        errors.append('index_complete_row_set')
    # The prefix is recomputed from the event's own bytes, not from the read's copy of their hash.
    expected_prefix = typed_tree(binding_digest({'domain': 'pm.event_index.retained_prefix.v1', 'entries': [{
        'sequence_id': event['sequence_id'], 'event_id': event['event_id'],
        'scope_partition': case['scope_partition'], 'source_value_sha256': source_value_sha256}]}))
    if typed_tree(node['anchor']['retained_event_prefix_sha256']) != expected_prefix:
        errors.append('index_source_prefix')
    if typed_tree(frontier['coverage']['retained_event_prefix_sha256']) != expected_prefix:
        errors.append('index_source_prefix')
    if typed_tree(node['anchor']['source_selection']['manifest_survivor_prefix_sha256']) != expected_prefix:
        errors.append('index_source_prefix')
    if typed_tree(frontier['source_selection']['manifest_survivor_prefix_sha256']) != expected_prefix:
        errors.append('index_source_prefix')
    # The row's birth triple: the two manifest facts are the anchor's, and the survivor prefix is the prefix itself.
    locator = row['publication_locator']
    if typed_tree(locator['manifest_generation']) != typed_tree(node['anchor']['source_selection']['manifest_generation']):
        errors.append('index_birth_anchor_join')
    if typed_tree(locator['recovery_epoch']) != typed_tree(node['anchor']['source_selection']['recovery_epoch']):
        errors.append('index_birth_anchor_join')
    if typed_tree(locator['survivor_prefix_sha256']) != expected_prefix:
        errors.append('index_birth_anchor_join')
    coverage = frontier['coverage']
    # DO-P1F05: a null last frame names no frame, so none of the frame and segment copies below can be read.
    # The schema admits it only in the empty-retained-source form, which a frontier covering this event
    # contradicts. Refused here with its own code, where it used to raise TypeError.
    if coverage['last_frame'] is None:
        return errors + ['index_coverage_last_frame_null']
    # DO-P1F05: the sequence facts that used to share this code are now sequence_copy_errors predicates.
    if coverage['complete_to_captured_boundary'] is not True:
        errors.append('index_complete_source_coverage')
    if typed_tree(coverage['last_frame']['last_event_id']) != typed_tree(event['event_id']):
        errors.append('index_coverage_frame_last_event_id')
    errors += coverage_copy_errors(event, coverage)
    errors += sequence_copy_errors(event, node['anchor'], coverage)
    # DO-P1F06: the segment identity, source selection, gap, row locator and generation identity copies.
    errors += segment_identity_errors(coverage)
    errors += selection_copy_errors(node['anchor'], frontier)
    errors += sequence_gap_errors(event, coverage)
    errors += row_locator_copy_errors(event, row, node, coverage)
    errors += generation_copy_errors(storage_id, cp['generations'])
    return errors


# DO-P1F06: the index row's copies of the event, compared field by field. The first eight were read before this
# round (by Python `!=`); the rest were never read. storage_value_registry.json's event_record_index row and the
# readiness projector (scripts/pm-implementation-readiness.py, the legacy-normalization index value) fix each one.
ROW_EVENT_COPY_FIELDS = (
    'scope_kind', 'project_id', 'scope_partition', 'sequence_id', 'event_id', 'event_type',
    'producer_semantic_digest', 'idempotency_key',
    'payload_sha256', 'correlation_id', 'causation_event_id', 'persisted_at_utc', 'redaction_profile',
    'source_schema_id', 'source_schema_version', 'projector_replay_only')


def payload_digest(event):
    """The index row's `payload_sha256`: SHA-256 of the RFC 8785 bytes of the event's inline payload.

    The recipe every original row of this file used (all 53 event cases before DO-P1F-03 regenerated the board
    payloads) and the readiness projector's (`hashlib.sha256(jcs_bytes(payload))`). Number spellings inside the
    payload follow the shared number rule (part 2, DO-C8-N2), not a lane-local serializer.
    """
    return hashlib.sha256(rfc8785.dumps(event.get('payload'))).hexdigest()


def row_source_schema(event):
    """The EventRecord schema the row was projected from: the migrated-from pair when the original was migrated
    (Case L-5: source ID `pm.event.envelope_v1`, null version), otherwise the record's own schema."""
    migration = event.get('migration') if isinstance(event.get('migration'), dict) else {}
    if migration.get('migrated_from_schema_id') is not None:
        return migration['migrated_from_schema_id'], migration.get('migrated_from_schema_version')
    return event.get('schema_id'), event.get('schema_version')


def expected_row_copies(case):
    event = case['event']
    source_schema_id, source_schema_version = row_source_schema(event)
    return {'scope_kind': event['scope_kind'], 'project_id': event['project_id'],
        'scope_partition': case['scope_partition'], 'sequence_id': event['sequence_id'],
        'event_id': event['event_id'], 'event_type': event['event_type'],
        'producer_semantic_digest': semantic_digest(event), 'idempotency_key': event['idempotency_key'],
        'payload_sha256': payload_digest(event), 'correlation_id': event.get('correlation_id'),
        'causation_event_id': event.get('causation_event_id'), 'persisted_at_utc': event.get('persisted_at_utc'),
        'redaction_profile': event.get('redaction_profile'), 'source_schema_id': source_schema_id,
        'source_schema_version': source_schema_version,
        'projector_replay_only': event.get('replay_policy') == 'projector_replay_only'}


def row_event_copy_errors(case, row):
    """Each index-row copy of the event, by exact type, with its own code `index_row_<field>`."""
    expected = expected_row_copies(case)
    assert tuple(expected) == ROW_EVENT_COPY_FIELDS
    return ['index_row_' + k for k in ROW_EVENT_COPY_FIELDS if typed_tree(row.get(k)) != typed_tree(expected[k])]


SEGMENT_IDENTITY_CODES = ('index_coverage_segment_name_generation', 'index_coverage_segment_name_state')


def segment_identity_errors(coverage):
    """DO-P1F06 (DO-P1F5-N1): the segment name's generation field and its form are copies of the segment's identity.

    storage-plan.md:460-461 and :24306: `seg-{generation:06}-{first:020}.active` names an active segment and
    `seg-{generation:06}-{first:020}-{last:020}.seglog` a closed one. The generation field is the last frame's
    `segment_generation` in at least six zero-padded digits, so `seg-0000001-` (7 digits for 1) is that number
    written another way and refused. The form is `.active` exactly when the segment's state is `active`; the
    owner gives no separate name for `sealed_degraded`, which is immutable like `closed`, so both take `.seglog`.
    The name is read from the last frame; DO-P1F04's `index_coverage_segment_name` joins the segment's copy to it.
    """
    frame, segment = coverage['last_frame'], coverage['segments'][0]
    name = SEGMENT_NAME.fullmatch(frame['segment_name']) if type(frame['segment_name']) is str else None
    generation = frame['segment_generation']
    digits = f'{generation:06}' if type(generation) is int and generation >= 0 else None
    errors = []
    if name is None or name.group(1) != digits:
        errors.append('index_coverage_segment_name_generation')
    if name is not None and (name.group(3) is None) != (typed_tree(segment['state']) == typed_tree('active')):
        errors.append('index_coverage_segment_name_state')
    return errors


SELECTION_COPY_CODES = (
    'index_anchor_selected_segment_generation', 'index_frontier_selected_segment_generation',
    'index_frontier_current_bytes_sha256', 'index_frontier_recovery_epoch',
    'index_frontier_excluded_ranges_sha256', 'index_frontier_retired_inputs_sha256',
    'index_anchor_sequence_gaps_sha256')
# SP-278 (storage-plan.md:21279): the anchor gap digest covers the closed-reason gaps within the anchored
# first/through range, through the binding wrapper. In the one-event model that range is the retained event's own
# sequence, which no gap can hold, so the digest is the binding digest of the empty array.
EMPTY_GAPS_SHA256 = binding_digest([])


def selection_copy_errors(anchor, frontier):
    """DO-P1F06: copies inside the birth anchor's and the frontier's source selections.

    - selected_segment_generation (both selections, DO-P1F5-N1): storage-plan.md:17330 and :17293 require every
      frame's segment generation to match the selected segment generation, so the selection's copy is the last
      frame's `segment_generation`.
    - The frontier's CURRENT digest, recovery epoch, excluded ranges and retired inputs are the anchor's:
      storage-plan.md:21293 rebuilds a fresh generation on rotation, recovery, exclusions, compaction, a changed
      CURRENT byte digest, selected segment generation or recovery epoch, so within one generation they cannot
      move. The manifest digest and generation, retained inventory, durable watermarks and survivor prefix may
      change on an ordinary append (storage-plan.md:21291) and are not tied here (the prefix has its own guard).
    - The anchor's gap digest: EMPTY_GAPS_SHA256.
    """
    frame = frontier['coverage']['last_frame']
    birth, current = anchor['source_selection'], frontier['source_selection']
    generation = typed_tree(frame['segment_generation'])
    errors = []
    if typed_tree(birth['selected_segment_generation']) != generation:
        errors.append('index_anchor_selected_segment_generation')
    if typed_tree(current['selected_segment_generation']) != generation:
        errors.append('index_frontier_selected_segment_generation')
    if typed_tree(current['current_bytes_sha256']) != typed_tree(birth['current_bytes_sha256']):
        errors.append('index_frontier_current_bytes_sha256')
    if typed_tree(current['recovery_epoch']) != typed_tree(birth['recovery_epoch']):
        errors.append('index_frontier_recovery_epoch')
    if typed_tree(current['excluded_ranges_sha256']) != typed_tree(birth['excluded_ranges_sha256']):
        errors.append('index_frontier_excluded_ranges_sha256')
    if typed_tree(current['retired_inputs_sha256']) != typed_tree(birth['retired_inputs_sha256']):
        errors.append('index_frontier_retired_inputs_sha256')
    if typed_tree(anchor['sequence_gaps_sha256']) != typed_tree(EMPTY_GAPS_SHA256):
        errors.append('index_anchor_sequence_gaps_sha256')
    return errors


SEQUENCE_GAP_CODES = ('index_coverage_sequence_gap_retained', 'index_coverage_sequence_gap_order')


def sequence_gap_errors(event, coverage):
    """DO-P1F06: the frontier's gaps are free data (SP-278: legal gaps need actual manifest evidence this value does
    not carry), bounded here by two facts the value itself contradicts: a gap names sequence ids with no retained
    event, so it cannot hold the covered event's own sequence; and a gap's first id is not after its last."""
    sequence = event['sequence_id']
    gaps = coverage['sequence_gaps']
    errors = []
    if any(gap['first_sequence_id'] <= sequence <= gap['last_sequence_id'] for gap in gaps):
        errors.append('index_coverage_sequence_gap_retained')
    if any(gap['first_sequence_id'] > gap['last_sequence_id'] for gap in gaps):
        errors.append('index_coverage_sequence_gap_order')
    return errors


ROW_LOCATOR_CODES = (
    'index_row_source_segment_generation', 'index_row_source_segment_name', 'index_row_source_byte_offset',
    'index_row_source_sequence_id', 'index_row_translation_ref')


def row_locator_copy_errors(event, row, node, coverage):
    """DO-P1F06: the index row's physical cursor and translation reference.

    `source_locator` is the exact four-field frame cursor `(segment_generation, segment_name, byte_offset,
    sequence_id)` (storage-plan.md:20886, :24710); the registry requires its sequence to equal the outer one and
    points rows only at the CURRENT-selected segment generation. In the one-event model the frame is the event's,
    starting at the segment's scan start. So the generation and name are the last frame's, the offset is the
    segment's `scan_start_offset` and the sequence is the event's. `compaction_translation_manifest_ref` is null
    unless the generation carries a translation, and then it is null (an appended suffix row) or that translation's
    manifest (SP-278: translated rows keep their ref, suffix rows use none).
    """
    frame, segment = coverage['last_frame'], coverage['segments'][0]
    source = row['source_locator'] if isinstance(row.get('source_locator'), dict) else {}
    publication = row['publication_locator'] if isinstance(row.get('publication_locator'), dict) else {}
    errors = []
    if typed_tree(source.get('segment_generation')) != typed_tree(frame['segment_generation']):
        errors.append('index_row_source_segment_generation')
    if typed_tree(source.get('segment_name')) != typed_tree(frame['segment_name']):
        errors.append('index_row_source_segment_name')
    if typed_tree(source.get('byte_offset')) != typed_tree(segment['scan_start_offset']):
        errors.append('index_row_source_byte_offset')
    if typed_tree(source.get('sequence_id')) != typed_tree(event['sequence_id']):
        errors.append('index_row_source_sequence_id')
    translation = node['translation']
    allowed = [typed_tree(None)] + ([typed_tree(translation['manifest_ref'])] if translation is not None else [])
    if typed_tree(publication.get('compaction_translation_manifest_ref')) not in allowed:
        errors.append('index_row_translation_ref')
    return errors


GENERATION_COPY_CODES = (
    'index_generation_id', 'index_generation_dataset_name', 'index_generation_id_recipe',
    'index_generation_translation_origin', 'index_translation_target_selection')


def generation_identity(storage_instance_id, node):
    """SP-278 (storage-plan.md:21269): `eig_` plus the binding digest of the object with domain
    `pm.event_index.generation.v1`, the storage instance, the projector version, the birth source selection and
    the generation seed. No caller, timestamp or row chooses a generation."""
    anchor = node['anchor']
    return 'eig_' + binding_digest({'domain': 'pm.event_index.generation.v1', 'storage_instance_id': storage_instance_id,
        'projector_version': node['projector_version'], 'source_selection': anchor['source_selection'],
        'generation_seed_sha256': anchor['generation_seed_sha256']})


def generation_copy_errors(storage_instance_id, generations):
    """DO-P1F06: every node's copies of its own identity, current or not.

    The map key is the generation id the recipe gives; the node's `generation_id` and `index_dataset_name`
    (`event_record_index.v2@{generation_id}`, storage-plan.md:21269) are copies of that key. A translation is a
    compaction translation (SP-278), so it appears only on a `compaction_shadow` generation, and its target selection
    binds that generation's own birth selection (storage-plan.md:21297; the binding wrapper covers source-selection
    objects used in translation, :21275).
    """
    errors = []
    for key, node in generations.items():
        if typed_tree(node['generation_id']) != typed_tree(key):
            errors.append('index_generation_id')
        if typed_tree(node['index_dataset_name']) != typed_tree('event_record_index.v2@' + key):
            errors.append('index_generation_dataset_name')
        if typed_tree(generation_identity(storage_instance_id, node)) != typed_tree(key):
            errors.append('index_generation_id_recipe')
        translation = node['translation']
        if translation is not None and typed_tree(node['origin']) != typed_tree('compaction_shadow'):
            errors.append('index_generation_translation_origin')
        if translation is not None and typed_tree(translation['target_selection_sha256']) != typed_tree(
                binding_digest(node['anchor']['source_selection'])):
            errors.append('index_translation_target_selection')
    return errors


P1F06_CODES = (tuple('index_row_' + k for k in ROW_EVENT_COPY_FIELDS[8:]) + SEGMENT_IDENTITY_CODES
               + SELECTION_COPY_CODES + SEQUENCE_GAP_CODES + ROW_LOCATOR_CODES + GENERATION_COPY_CODES)


COVERAGE_COPY_CODES = (
    'index_coverage_segment_count', 'index_coverage_segment_generation', 'index_coverage_segment_name',
    'index_coverage_frame_byte_offset', 'index_coverage_frame_end_offset',
    'index_coverage_scanned_through_offset', 'index_coverage_source_durable_end_offset',
    'index_coverage_source_durable_bytes_sha256')


def coverage_copy_errors(event, coverage):
    """DO-P1F04: the frontier's copies of the covered event's bytes must be that event's bytes.

    In this lane's one-event model the coverage holds one segment, the one the last frame names, and its one
    frame is the event's complete canonical MessagePack bytes (`packed`) from the segment's scan start. So the
    frame end, the segment's scanned-through and durable end offsets and its durable bytes' SHA-256 are each
    recomputed from the event, never trusted as supplied, and compared by exact type (`typed_tree`), so 1344.0
    or "1344" is not 1344. The first four predicates locate the segment and frame those copies are read from.
    """
    data = packed(event)
    size, digest = typed_tree(len(data)), typed_tree(hashlib.sha256(data).hexdigest())
    frame, segments = coverage['last_frame'], coverage['segments']
    segment = segments[0]
    errors = []
    if len(segments) != 1:
        errors.append('index_coverage_segment_count')
    if typed_tree(segment['segment_generation']) != typed_tree(frame['segment_generation']):
        errors.append('index_coverage_segment_generation')
    if typed_tree(segment['segment_name']) != typed_tree(frame['segment_name']):
        errors.append('index_coverage_segment_name')
    if typed_tree(frame['byte_offset']) != typed_tree(segment['scan_start_offset']):
        errors.append('index_coverage_frame_byte_offset')
    if typed_tree(frame['frame_end_offset']) != size:
        errors.append('index_coverage_frame_end_offset')
    if typed_tree(segment['scanned_through_offset']) != size:
        errors.append('index_coverage_scanned_through_offset')
    if typed_tree(segment['source_durable_end_offset']) != size:
        errors.append('index_coverage_source_durable_end_offset')
    if typed_tree(segment['source_durable_bytes_sha256']) != digest:
        errors.append('index_coverage_source_durable_bytes_sha256')
    return errors


SEQUENCE_COPY_CODES = (
    'index_coverage_first_retained_sequence_id', 'index_coverage_through_sequence_id',
    'index_coverage_retained_event_count', 'index_coverage_frame_last_sequence_id',
    'index_coverage_segment_first_sequence_id', 'index_coverage_segment_last_sequence_id',
    'index_coverage_segment_retained_event_count', 'index_coverage_segment_name_first_sequence',
    'index_coverage_segment_name_last_sequence', 'index_anchor_first_retained_sequence_id',
    'index_anchor_through_sequence_id', 'index_anchor_retained_event_count')
# storage-plan.md:460-461: seg-{generation:06}-{start_seq:020}.active and seg-{generation:06}-{start_seq:020}-{end_seq:020}.seglog,
# the grammar of the checkpoint schema's segment_name pattern.
SEGMENT_NAME = re.compile(r'seg-([0-9]{6,})-([0-9]{20})(?:-([0-9]{20})\.seglog|\.active)')


def sequence_copy_errors(event, anchor, coverage):
    """DO-P1F05: every copy of the covered event's sequence number in the frontier and the anchor is that number.

    In this lane's one-event model the generation's birth anchor and its current frontier each retain exactly the
    covered event, in the one segment the last frame names. So each first, through and last sequence is the
    event's Storage-assigned `sequence_id`, each retained count is one, and the segment name's first-sequence field
    (and a closed name's last-sequence field) is that number in 20 zero-padded digits. Every copy is recomputed from
    the event and compared by exact type (`typed_tree`), so 7.0, "7", true or null is not 7 and true is not 1.
    The name is read from the last frame; DO-P1F04's `index_coverage_segment_name` joins the segment's name to it.
    Requires a non-null last frame: checkpoint_errors refuses a null one first.
    """
    sequence, one = typed_tree(event['sequence_id']), typed_tree(1)
    digits = f"{event['sequence_id']:020}" if type(event['sequence_id']) is int else None
    frame, segment = coverage['last_frame'], coverage['segments'][0]
    name = SEGMENT_NAME.fullmatch(frame['segment_name']) if type(frame['segment_name']) is str else None
    errors = []
    if typed_tree(coverage['first_retained_sequence_id']) != sequence:
        errors.append('index_coverage_first_retained_sequence_id')
    if typed_tree(coverage['through_sequence_id']) != sequence:
        errors.append('index_coverage_through_sequence_id')
    if typed_tree(coverage['retained_event_count']) != one:
        errors.append('index_coverage_retained_event_count')
    if typed_tree(frame['last_sequence_id']) != sequence:
        errors.append('index_coverage_frame_last_sequence_id')
    if typed_tree(segment['first_sequence_id']) != sequence:
        errors.append('index_coverage_segment_first_sequence_id')
    if typed_tree(segment['last_sequence_id']) != sequence:
        errors.append('index_coverage_segment_last_sequence_id')
    if typed_tree(segment['retained_event_count']) != one:
        errors.append('index_coverage_segment_retained_event_count')
    if name is None or name.group(2) != digits:
        errors.append('index_coverage_segment_name_first_sequence')
    if name is not None and name.group(3) is not None and name.group(3) != digits:
        errors.append('index_coverage_segment_name_last_sequence')
    if typed_tree(anchor['first_retained_sequence_id']) != sequence:
        errors.append('index_anchor_first_retained_sequence_id')
    if typed_tree(anchor['through_sequence_id']) != sequence:
        errors.append('index_anchor_through_sequence_id')
    if typed_tree(anchor['retained_event_count']) != one:
        errors.append('index_anchor_retained_event_count')
    return errors


def coverage_copy_negatives(case):
    """One single-defect negative per coverage predicate, built from a valid case.

    Each changes exactly one field of the frontier and re-digests the frontier into the read token, the one
    dependent copy, so the coverage predicate is the only defect. Yields (name, case, expected code).
    """
    read = case['read']
    frontier = read['checkpoint']['generations'][read['checkpoint']['current_generation_id']]['frontier']
    coverage = frontier['coverage']
    data = packed(case['event'])
    # Another schema-valid name: the segment's first-sequence field moves by one, the suffix stays.
    renamed = re.sub(r'^(seg-[0-9]{6,}-)([0-9]{20})', lambda match: match.group(1) + f'{int(match.group(2)) + 1:020}',
                     coverage['segments'][0]['segment_name'])
    assert renamed != coverage['segments'][0]['segment_name']
    changes = (
        ('index_coverage_segment_count', lambda c: c['segments'].append(copy.deepcopy(c['segments'][0]))),
        ('index_coverage_segment_generation', lambda c: c['segments'][0].update(
            segment_generation=c['segments'][0]['segment_generation'] + 1)),
        ('index_coverage_segment_name', lambda c: c['segments'][0].update(segment_name=renamed)),
        ('index_coverage_frame_byte_offset', lambda c: c['last_frame'].update(byte_offset=c['last_frame']['byte_offset'] + 1)),
        ('index_coverage_frame_end_offset', lambda c: c['last_frame'].update(frame_end_offset=len(data) + 1)),
        ('index_coverage_scanned_through_offset', lambda c: c['segments'][0].update(scanned_through_offset=len(data) + 1)),
        ('index_coverage_source_durable_end_offset', lambda c: c['segments'][0].update(source_durable_end_offset=len(data) + 1)),
        ('index_coverage_source_durable_bytes_sha256', lambda c: c['segments'][0].update(
            source_durable_bytes_sha256=hashlib.sha256(b'foreign:' + data).hexdigest())),
    )
    assert tuple(code for code, _ in changes) == COVERAGE_COPY_CODES
    for code, change in changes:
        bad = copy.deepcopy(case)
        read = bad['read']
        bad_frontier = read['checkpoint']['generations'][read['checkpoint']['current_generation_id']]['frontier']
        change(bad_frontier['coverage'])
        read['read_token']['frontier_sha256'] = binding_digest(bad_frontier)
        yield code.removeprefix('index_coverage_'), bad, code


def frontier_coverage(case):
    read = case['read']
    return read['checkpoint']['generations'][read['checkpoint']['current_generation_id']]['frontier']['coverage']


# Wrong representations of each copy the guard reads: (code, container, field, forms).
COVERAGE_TYPE_FORMS = (
    ('index_coverage_segment_generation', 'segment', 'segment_generation', ('float', 'string', 'bool')),
    ('index_coverage_segment_name', 'segment', 'segment_name', ('null', 'trailing_lf')),
    ('index_coverage_frame_byte_offset', 'frame', 'byte_offset', ('float', 'string', 'bool')),
    ('index_coverage_frame_end_offset', 'frame', 'frame_end_offset', ('float', 'string')),
    ('index_coverage_scanned_through_offset', 'segment', 'scanned_through_offset', ('float', 'string')),
    ('index_coverage_source_durable_end_offset', 'segment', 'source_durable_end_offset', ('float', 'string')),
    ('index_coverage_source_durable_bytes_sha256', 'segment', 'source_durable_bytes_sha256', ('null', 'upper', 'trailing_lf')),
)


def wrong_form(value, form):
    return {'float': lambda: float(value), 'string': lambda: str(value), 'bool': lambda: bool(value),
            'null': lambda: None, 'upper': lambda: value.upper(), 'trailing_lf': lambda: value + '\n'}[form]()


def coverage_copy_checks(fixtures, schema, owner_module):
    """DO-P1F04: every positive's frontier copies agree with its own event; each predicate has its negative."""
    root, formats = owner_module.ROOT, owner_module.UTC_FORMAT
    checks = 0
    for key in ('event_cases', 'retained_event_cases', 'compatibility_event_cases'):
        for case in fixtures[key]:
            assert not coverage_copy_errors(case['event'], frontier_coverage(case)), (key, case['case_id'])
            checks += 1
            for name, bad, code in coverage_copy_negatives(case):
                assert checkpoint_errors(bad, root, formats) == [code], (key, case['case_id'], name)
                assert historical_read_errors(bad, schema, owner_module) == [code], (key, case['case_id'], name)
                checks += 2
                if key == 'event_cases':
                    assert recover_original(bad, schema, owner_module) == {
                        'status': 'historical_original_unverified', 'appended': False, 'receipt': None}
                    checks += 1
    # Exact type: the guard itself refuses every other representation of a copy. Through checkpoint_errors the
    # strict checkpoint schema (exact type, full-match patterns) refuses each non-float form first.
    for case in fixtures['event_cases']:
        for code, container, field, forms in COVERAGE_TYPE_FORMS:
            for form in forms:
                bad = copy.deepcopy(case)
                coverage = frontier_coverage(bad)
                target = coverage['last_frame'] if container == 'frame' else coverage['segments'][0]
                target[field] = wrong_form(target[field], form)
                assert coverage_copy_errors(bad['event'], coverage) == [code], (case['case_id'], field, form)
                checks += 1
                try:
                    frontier = bad['read']['checkpoint']['generations'][bad['read']['checkpoint']['current_generation_id']]['frontier']
                    bad['read']['read_token']['frontier_sha256'] = binding_digest(frontier)
                except TypeError:
                    # The checkpoint schema's integer type admits 1344.0, but SP-278's binding codec takes no
                    # float, so checkpoint_errors cannot digest the frontier and refuses by raising.
                    assert form == 'float', (case['case_id'], field, form)
                    try:
                        checkpoint_errors(bad, root, formats)
                    except TypeError:
                        checks += 1
                        continue
                    raise AssertionError(('float_copy_digested', case['case_id'], field))
                assert checkpoint_errors(bad, root, formats) == ['checkpoint_schema'], (case['case_id'], field, form)
                checks += 1
    return checks


def checkpoint_node(case):
    read = case['read']
    return read['checkpoint']['generations'][read['checkpoint']['current_generation_id']]


def redigest(case, row_set=True):
    """Keep the dependent digest copies in step: the frontier's row-set digest of the one index row (DO-P1F06: the
    row now holds copies of the frame too), then the read token's digests of the birth anchor and the frontier."""
    node, read = checkpoint_node(case), case['read']
    if row_set:
        node['frontier']['index_row_set_sha256'] = binding_digest({'domain': 'pm.event_index.row_set.v1', 'entries': [
            {'key': read['row_key'], 'value': read['row']}]})
    read['read_token']['generation_anchor_sha256'] = binding_digest(node['anchor'])
    read['read_token']['frontier_sha256'] = binding_digest(node['frontier'])
    return case


def set_segment_name(case, first, last=None, state=None):
    """Every copy of the one segment's name (the segment's, the last frame's and, since DO-P1F06, the index row's
    source locator), in the grammar's form, keeping the name's generation field."""
    coverage = frontier_coverage(case)
    segment = coverage['segments'][0]
    generation = SEGMENT_NAME.fullmatch(segment['segment_name']).group(1)
    name = f'seg-{generation}-{first:020}' + ('.active' if last is None else f'-{last:020}.seglog')
    segment['segment_name'] = coverage['last_frame']['segment_name'] = name
    case['read']['row']['source_locator']['segment_name'] = name
    if state is not None:
        segment['state'] = state
    return case


def closed_segment_case(case):
    """The valid case with its one segment closed: a closed name in both copies whose two sequence fields are the
    event's, and state closed. The bytes, offsets and receipts are unchanged (storage-plan.md:24306)."""
    closed = copy.deepcopy(case)
    sequence = closed['event']['sequence_id']
    assert SEGMENT_NAME.fullmatch(frontier_coverage(closed)['segments'][0]['segment_name']).group(3) is None
    return redigest(set_segment_name(closed, sequence, sequence, 'closed'))


def sequence_copy_negatives(case):
    """One single-defect negative per sequence_copy_errors predicate, built from a valid case.

    Each changes one copy of the event's sequence number (or one count) and keeps the read token's anchor and
    frontier digests in step, so the predicate is the only defect. First-sequence copies move down by one and
    through/last copies up by one, so first <= through still holds. The name changes in both of its copies, which
    DO-P1F04's `index_coverage_segment_name` keeps equal. The closed name's last field is changed on the closed
    control. Yields (name, case, expected code).
    """
    sequence = case['event']['sequence_id']
    assert type(sequence) is int and sequence > 0
    anchor = lambda c: checkpoint_node(c)['anchor']
    segment = lambda c: frontier_coverage(c)['segments'][0]
    changes = (
        ('index_coverage_first_retained_sequence_id', case,
         lambda c: frontier_coverage(c).update(first_retained_sequence_id=sequence - 1)),
        ('index_coverage_through_sequence_id', case, lambda c: frontier_coverage(c).update(through_sequence_id=sequence + 1)),
        ('index_coverage_retained_event_count', case, lambda c: frontier_coverage(c).update(retained_event_count=2)),
        ('index_coverage_frame_last_sequence_id', case,
         lambda c: frontier_coverage(c)['last_frame'].update(last_sequence_id=sequence + 1)),
        ('index_coverage_segment_first_sequence_id', case, lambda c: segment(c).update(first_sequence_id=sequence - 1)),
        ('index_coverage_segment_last_sequence_id', case, lambda c: segment(c).update(last_sequence_id=sequence + 1)),
        ('index_coverage_segment_retained_event_count', case, lambda c: segment(c).update(retained_event_count=2)),
        ('index_coverage_segment_name_first_sequence', case, lambda c: set_segment_name(c, sequence + 1)),
        ('index_coverage_segment_name_last_sequence', closed_segment_case(case),
         lambda c: set_segment_name(c, sequence, sequence + 1)),
        ('index_anchor_first_retained_sequence_id', case, lambda c: anchor(c).update(first_retained_sequence_id=sequence - 1)),
        ('index_anchor_through_sequence_id', case, lambda c: anchor(c).update(through_sequence_id=sequence + 1)),
        ('index_anchor_retained_event_count', case, lambda c: anchor(c).update(retained_event_count=2)),
    )
    assert tuple(code for code, _, _ in changes) == SEQUENCE_COPY_CODES
    for code, base, change in changes:
        bad = copy.deepcopy(base)
        change(bad)
        yield code.removeprefix('index_'), redigest(bad), code


def frame_negatives(case):
    """DO-P1F05: the last frame's null and identity forms, and the coverage-complete flag. Yields (name, case, code).

    - empty_source_null_frame: the one schema-valid null last frame, the schema's empty-retained-source form (its
      allOf ties a null frame to empty_retained_source true, null first and through and a zero count). It claims
      no retained event where the frontier covers this one. It used to raise TypeError; now its own code.
    - bare_null_frame: last_frame null alone; the schema's allOf refuses it first.
    - last_event_id: another event's id in the last frame.
    - incomplete_coverage: complete_to_captured_boundary false; the schema's const refuses it first, and the
      runtime `index_complete_source_coverage` clause duplicates that const.
    """
    data = packed(case['event'])
    changes = (
        ('empty_source_null_frame', 'index_coverage_last_frame_null', lambda c: c.update(
            empty_retained_source=True, first_retained_sequence_id=None, through_sequence_id=None,
            retained_event_count=0, last_frame=None)),
        ('bare_null_frame', 'checkpoint_schema', lambda c: c.update(last_frame=None)),
        ('last_event_id', 'index_coverage_frame_last_event_id', lambda c: c['last_frame'].update(
            last_event_id='evt_do_' + hashlib.sha256(b'foreign:' + data).hexdigest())),
        ('incomplete_coverage', 'checkpoint_schema', lambda c: c.update(complete_to_captured_boundary=False)),
    )
    for name, code, change in changes:
        bad = copy.deepcopy(case)
        change(frontier_coverage(bad))
        yield name, redigest(bad), code


# Wrong representations of each sequence copy: (code, container, field, forms, forms the strict schema admits).
# A form the schema admits reaches the guard through checkpoint_errors; the others are `checkpoint_schema` there.
SEQUENCE_TYPE_FORMS = (
    ('index_coverage_first_retained_sequence_id', 'coverage', 'first_retained_sequence_id', ('float', 'string', 'bool', 'null'), ()),
    ('index_coverage_through_sequence_id', 'coverage', 'through_sequence_id', ('float', 'string', 'bool', 'null'), ()),
    ('index_coverage_retained_event_count', 'coverage', 'retained_event_count', ('float', 'string', 'bool', 'null'), ()),
    ('index_coverage_frame_last_sequence_id', 'frame', 'last_sequence_id', ('float', 'string', 'bool', 'null'), ()),
    ('index_coverage_segment_first_sequence_id', 'segment', 'first_sequence_id', ('float', 'string', 'bool', 'null'), ('null',)),
    ('index_coverage_segment_last_sequence_id', 'segment', 'last_sequence_id', ('float', 'string', 'bool', 'null'), ('null',)),
    ('index_coverage_segment_retained_event_count', 'segment', 'retained_event_count', ('float', 'string', 'bool', 'null'), ()),
    ('index_coverage_segment_name_first_sequence', 'frame', 'segment_name', ('null', 'trailing_lf', 'unpadded'), ()),
    ('index_anchor_first_retained_sequence_id', 'anchor', 'first_retained_sequence_id', ('float', 'string', 'bool', 'null'), ('null',)),
    ('index_anchor_through_sequence_id', 'anchor', 'through_sequence_id', ('float', 'string', 'bool', 'null'), ('null',)),
    ('index_anchor_retained_event_count', 'anchor', 'retained_event_count', ('float', 'string', 'bool', 'null'), ()),
)


def sequence_wrong_form(value, form):
    if form == 'unpadded':
        # The name's first-sequence field without its zero padding: the same number written another way.
        return re.sub(r'^(seg-[0-9]{6,}-)([0-9]{20})', lambda match: match.group(1) + str(int(match.group(2))), value)
    return wrong_form(value, form)


def sequence_target(case, container):
    coverage = frontier_coverage(case)
    return {'coverage': coverage, 'frame': coverage['last_frame'], 'segment': coverage['segments'][0],
            'anchor': checkpoint_node(case)['anchor']}[container]


def sequence_copy_checks(fixtures, schema, owner_module):
    """DO-P1F05: every positive's sequence copies agree with its own event; each predicate has its negative."""
    root, formats = owner_module.ROOT, owner_module.UTC_FORMAT
    unverified = {'status': 'historical_original_unverified', 'appended': False, 'receipt': None}
    checks = 0
    for key in ('event_cases', 'retained_event_cases', 'compatibility_event_cases'):
        for case in fixtures[key]:
            assert not sequence_copy_errors(case['event'], checkpoint_node(case)['anchor'], frontier_coverage(case)), (key, case['case_id'])
            closed = closed_segment_case(case)
            assert checkpoint_errors(closed, root, formats) == [], (key, case['case_id'], 'closed_segment')
            assert historical_read_errors(closed, schema, owner_module) == [], (key, case['case_id'], 'closed_segment')
            checks += 3
            for name, bad, code in [*sequence_copy_negatives(case), *frame_negatives(case)]:
                assert checkpoint_errors(bad, root, formats) == [code], (key, case['case_id'], name)
                assert historical_read_errors(bad, schema, owner_module) == [code], (key, case['case_id'], name)
                checks += 2
                if key == 'event_cases':
                    assert recover_original(bad, schema, owner_module) == unverified, (case['case_id'], name)
                    checks += 1
    # Builder control: Storage assigns the event another sequence number, and recapture_history derives every copy.
    for case in fixtures['event_cases']:
        moved = copy.deepcopy(case)
        moved['event']['sequence_id'] += 1
        recapture_history(moved)
        assert checkpoint_errors(moved, root, formats) == [], (case['case_id'], 'resequenced')
        assert historical_read_errors(moved, schema, owner_module) == [], (case['case_id'], 'resequenced')
        assert recover_original(moved, schema, owner_module)['status'] == 'original_result', case['case_id']
        checks += 3
    # Exact type: the guard itself refuses every other representation of a copy. Through checkpoint_errors the
    # strict schema refuses the forms it does not admit; an integral float raises in SP-278's binding codec
    # (DO-P1F4-S1, part 2).
    for case in fixtures['event_cases']:
        for code, container, field, forms, admitted in SEQUENCE_TYPE_FORMS:
            for form in forms:
                bad = copy.deepcopy(case)
                target = sequence_target(bad, container)
                target[field] = sequence_wrong_form(target[field], form)
                assert sequence_copy_errors(bad['event'], checkpoint_node(bad)['anchor'], frontier_coverage(bad)) == [code], (
                    case['case_id'], field, form)
                checks += 1
                try:
                    redigest(bad)
                except TypeError:
                    assert form == 'float', (case['case_id'], field, form)
                    try:
                        checkpoint_errors(bad, root, formats)
                    except TypeError:
                        checks += 1
                        continue
                    raise AssertionError(('float_copy_digested', case['case_id'], field))
                expected = [code] if form in admitted else ['checkpoint_schema']
                assert checkpoint_errors(bad, root, formats) == expected, (case['case_id'], field, form)
                assert historical_read_errors(bad, schema, owner_module) == expected, (case['case_id'], field, form)
                checks += 2
    return checks


# ---------------------------------------------------------------------------------------------------------------
# DO-P1F06: single-defect negatives for every derived checkpoint field, controls, and the field inventory.

FOREIGN_STORAGE_ID = '22222222-2222-4222-8222-222222222222'
UNVERIFIED_ORIGINAL = {'status': 'historical_original_unverified', 'appended': False, 'receipt': None}
POSITIVE_KEYS = ('event_cases', 'retained_event_cases', 'compatibility_event_cases')


def foreign_hex(value):
    return hashlib.sha256(b'foreign:' + str(value).encode('utf-8')).hexdigest()


def resync_selection_copies(case):
    """The read token's and the read's copies of the frontier's source selection, after it changed."""
    current = checkpoint_node(case)['frontier']['source_selection']
    case['read']['read_token']['source_selection'] = copy.deepcopy(current)
    case['read']['current_source_selection'] = copy.deepcopy(current)
    return case


def resync_frontier_selection(case):
    return redigest(resync_selection_copies(case))


def resync_birth_selection(case):
    """A changed birth selection changes the generation id the recipe gives: write it and every copy, then digest."""
    return redigest(rekey(case))


def set_name_generation(case, digits):
    """Every copy of the one segment's name with its generation field written as `digits`."""
    coverage = frontier_coverage(case)
    name = re.sub(r'^seg-[0-9]{6,}-', 'seg-' + digits + '-', coverage['last_frame']['segment_name'])
    coverage['segments'][0]['segment_name'] = coverage['last_frame']['segment_name'] = name
    case['read']['row']['source_locator']['segment_name'] = name
    return case


def translation_value(case):
    """A schema-valid compaction translation for the current generation. Its target selection is the generation's
    birth selection; the other members are opaque owner evidence (SP-278's assumed adapter witnesses)."""
    event_id = case['event']['event_id']
    return {'manifest_ref': 'compaction-manifest:' + event_id, 'manifest_sha256': foreign_hex('manifest:' + event_id),
            'source_index_generation_id': 'eig_' + foreign_hex('source-generation:' + event_id),
            'source_selection_sha256': foreign_hex('source-selection:' + event_id),
            'target_selection_sha256': binding_digest(checkpoint_node(case)['anchor']['source_selection']),
            'preserved_event_count': 1, 'removed_event_count': 0,
            'semantic_outcomes_sha256': foreign_hex('outcomes:' + event_id)}


def gap_value(case, first, last, reason='retention_compaction'):
    event_id = case['event']['event_id']
    return {'reason': reason, 'first_sequence_id': first, 'last_sequence_id': last,
            'manifest_evidence_ref': 'manifest-gap:' + event_id, 'manifest_evidence_sha256': foreign_hex('gap:' + event_id)}


def compaction_control(case, translated_row=False):
    """The valid case as a compaction shadow: origin compaction_shadow with a translation whose target selection is
    the generation's birth selection. The row is an appended suffix row (null translation ref), or, translated_row,
    a translated row naming the translation's manifest. Both must be accepted."""
    control = copy.deepcopy(case)
    node = checkpoint_node(control)
    node['origin'] = 'compaction_shadow'
    node['translation'] = translation_value(control)
    if translated_row:
        control['read']['row']['publication_locator']['compaction_translation_manifest_ref'] = node['translation']['manifest_ref']
    return redigest(control)


def gap_control(case):
    """The valid case with one legal gap below the retained event: retention compaction removed sequences 1 through
    sequence - 1. The anchored range is the event's own sequence, so the anchor's gap digest still covers no gap."""
    control = copy.deepcopy(case)
    sequence = control['event']['sequence_id']
    assert type(sequence) is int and sequence > 1
    frontier_coverage(control)['sequence_gaps'] = [gap_value(case, 1, sequence - 1)]
    return redigest(control)


def identity_copy_negatives(case):
    """DO-P1F06: one single-defect negative per new predicate, built from a valid case or its compaction control.

    Each changes one derived copy, keeps its source, and keeps every dependent copy in step: the row-set digest and
    the token's anchor and frontier digests (redigest); the token's and the read's copies of a changed frontier
    selection; and, for a change to the birth selection, the generation id the recipe gives and every copy of it.
    Yields (name, case, codes, base, repairs); repairs: recapture_history restores base from the negative.
    """
    event = case['event']
    sequence = event['sequence_id']
    assert type(sequence) is int and sequence >= 2
    expected = expected_row_copies(case)
    row = lambda c: c['read']['row']
    source = lambda c: c['read']['row']['source_locator']
    node = lambda c: checkpoint_node(c)
    birth = lambda c: checkpoint_node(c)['anchor']['source_selection']
    current = lambda c: checkpoint_node(c)['frontier']['source_selection']
    generation = frontier_coverage(case)['last_frame']['segment_generation']
    redaction = next(x for x in ('redacted', 'no_secrets') if x != expected['redaction_profile'])
    persisted = next(x for x in ('1999-01-01T00:00:00Z', '1999-01-02T00:00:00Z') if x != expected['persisted_at_utc'])
    renamed = re.sub(r'^(seg-[0-9]{6,}-)([0-9]{20})', lambda match: match.group(1) + f'{int(match.group(2)) + 1:020}',
                     source(case)['segment_name'])
    forged = 'eig_' + foreign_hex(case['read']['checkpoint']['current_generation_id'])
    compaction = compaction_control(case)
    changes = (
        ('row_payload_sha256', 'index_row_payload_sha256', case,
         lambda c: row(c).update(payload_sha256=foreign_hex(expected['payload_sha256'])), redigest, True),
        ('row_correlation_id', 'index_row_correlation_id', case,
         lambda c: row(c).update(correlation_id=str(expected['correlation_id']) + '-foreign'), redigest, True),
        ('row_causation_event_id', 'index_row_causation_event_id', case, lambda c: row(c).update(
            causation_event_id='evt_do_' + foreign_hex(event['event_id']) if expected['causation_event_id'] is None else None),
         redigest, True),
        ('row_persisted_at_utc', 'index_row_persisted_at_utc', case, lambda c: row(c).update(persisted_at_utc=persisted),
         redigest, True),
        ('row_redaction_profile', 'index_row_redaction_profile', case,
         lambda c: row(c).update(redaction_profile=redaction), redigest, True),
        ('row_source_schema_id', 'index_row_source_schema_id', case,
         lambda c: row(c).update(source_schema_id='pm.event.envelope_v1'), redigest, True),
        ('row_source_schema_version', 'index_row_source_schema_version', case, lambda c: row(c).update(
            source_schema_version=None if expected['source_schema_version'] is not None else '2.0.0'), redigest, True),
        ('row_projector_replay_only', 'index_row_projector_replay_only', case,
         lambda c: row(c).update(projector_replay_only=not expected['projector_replay_only']), redigest, True),
        ('row_source_segment_generation', 'index_row_source_segment_generation', case,
         lambda c: source(c).update(segment_generation=generation + 1), redigest, True),
        ('row_source_segment_name', 'index_row_source_segment_name', case,
         lambda c: source(c).update(segment_name=renamed), redigest, True),
        ('row_source_byte_offset', 'index_row_source_byte_offset', case,
         lambda c: source(c).update(byte_offset=source(c)['byte_offset'] + 1), redigest, True),
        ('row_source_sequence_id', 'index_row_source_sequence_id', case,
         lambda c: source(c).update(sequence_id=sequence + 1), redigest, True),
        ('row_translation_ref', 'index_row_translation_ref', case, lambda c: row(c)['publication_locator'].update(
            compaction_translation_manifest_ref='compaction-manifest:foreign'), redigest, True),
        ('segment_name_generation', 'index_coverage_segment_name_generation', case,
         lambda c: set_name_generation(c, f'{generation + 1:06}'), redigest, True),
        ('segment_name_state', 'index_coverage_segment_name_state', case,
         lambda c: set_segment_name(c, sequence, sequence), redigest, True),
        ('anchor_selected_segment_generation', 'index_anchor_selected_segment_generation', case,
         lambda c: birth(c).update(selected_segment_generation=generation + 1), resync_birth_selection, True),
        ('frontier_selected_segment_generation', 'index_frontier_selected_segment_generation', case,
         lambda c: current(c).update(selected_segment_generation=generation + 1), resync_frontier_selection, True),
        ('frontier_current_bytes_sha256', 'index_frontier_current_bytes_sha256', case, lambda c: current(c).update(
            current_bytes_sha256=foreign_hex(current(c)['current_bytes_sha256'])), resync_frontier_selection, True),
        ('frontier_recovery_epoch', 'index_frontier_recovery_epoch', case,
         lambda c: current(c).update(recovery_epoch=current(c)['recovery_epoch'] + 1), resync_frontier_selection, True),
        ('frontier_excluded_ranges_sha256', 'index_frontier_excluded_ranges_sha256', case, lambda c: current(c).update(
            excluded_ranges_sha256=foreign_hex(current(c)['excluded_ranges_sha256'])), resync_frontier_selection, True),
        ('frontier_retired_inputs_sha256', 'index_frontier_retired_inputs_sha256', case, lambda c: current(c).update(
            retired_inputs_sha256=foreign_hex(current(c)['retired_inputs_sha256'])), resync_frontier_selection, True),
        ('anchor_sequence_gaps_sha256', 'index_anchor_sequence_gaps_sha256', case, lambda c: node(c)['anchor'].update(
            sequence_gaps_sha256=binding_digest([gap_value(case, sequence, sequence)])), redigest, True),
        ('sequence_gap_retained', 'index_coverage_sequence_gap_retained', case, lambda c: frontier_coverage(c).update(
            sequence_gaps=[gap_value(case, sequence, sequence, 'allocator_lease_abandoned')]), redigest, False),
        ('sequence_gap_order', 'index_coverage_sequence_gap_order', case, lambda c: frontier_coverage(c).update(
            sequence_gaps=[gap_value(case, sequence - 1, sequence - 2)]), redigest, False),
        ('generation_id', 'index_generation_id', case, lambda c: node(c).update(generation_id=forged), None, True),
        ('generation_dataset_name', 'index_generation_dataset_name', case,
         lambda c: node(c).update(index_dataset_name='event_record_index.v2@' + forged), None, True),
        ('generation_id_recipe', 'index_generation_id_recipe', case, lambda c: rekey(c, forged), redigest, True),
        ('generation_translation_origin', 'index_generation_translation_origin', case,
         lambda c: node(c).update(translation=translation_value(c)), None, True),
        ('translation_target_selection', 'index_translation_target_selection', compaction,
         lambda c: node(c)['translation'].update(target_selection_sha256=foreign_hex('target-selection')), None, True),
    )
    assert {code for _, code, *_ in changes} == set(P1F06_CODES)
    for name, code, base, change, after, repairs in changes:
        bad = copy.deepcopy(base)
        change(bad)
        if after is not None:
            after(bad)
        yield name, bad, [code], base, repairs


def join_negatives(case):
    """DO-P1F06: single-defect negatives for the checkpoint guards that had none with an exact code.

    Before this round only `checkpoint_storage_identity` (standing check 7) had a fixture negative, and the read-token
    loop asserted only a non-empty refusal. Each negative here changes one derived field and keeps every dependent copy
    in step, as identity_copy_negatives does. The read token's storage instance is one invariant at two sites
    (`checkpoint_storage_identity` and the token join), so its negative names both codes. Yields like
    identity_copy_negatives.
    """
    event = case['event']
    read = case['read']
    node = lambda c: checkpoint_node(c)
    token = lambda c: c['read']['read_token']
    row = lambda c: c['read']['row']
    birth = lambda c: checkpoint_node(c)['anchor']['source_selection']
    current = lambda c: checkpoint_node(c)['frontier']['source_selection']
    forged = 'eig_' + foreign_hex(read['checkpoint']['current_generation_id'])
    foreign_key = 'event_record_index_checkpoint.v1:' + FOREIGN_STORAGE_ID
    other_family = next(t for t in ('parser.error', 'config.validation.failed') if t != event['event_type'])
    other_scope = 'application' if event['scope_kind'] == 'project' else 'project'

    def second_current(c):
        twin = copy.deepcopy(node(c))
        twin['anchor']['generation_seed_sha256'] = foreign_hex('second-seed')
        twin_id = generation_identity(c['logical_payload']['storage_instance_id'], twin)
        twin.update(generation_id=twin_id, index_dataset_name='event_record_index.v2@' + twin_id)
        c['read']['checkpoint']['generations'][twin_id] = twin

    def staged(c):
        node(c).update(state='staged', activated_at_utc=None)

    changes = (
        ('checkpoint_storage_instance_id', ['checkpoint_storage_identity'], lambda c: c['read']['checkpoint'].update(
            storage_instance_id=FOREIGN_STORAGE_ID), None, True),
        ('token_storage_instance_id', ['checkpoint_storage_identity', 'checkpoint_read_token_join'],
         lambda c: token(c).update(storage_instance_id=FOREIGN_STORAGE_ID), None, True),
        ('token_checkpoint_key', ['checkpoint_read_token_join'], lambda c: token(c).update(checkpoint_key=foreign_key), None, True),
        ('token_checkpoint_ref', ['checkpoint_read_token_join'], lambda c: token(c).update(
            checkpoint_ref=token(c)['checkpoint_key'] + '#/generations/' + forged), None, True),
        ('token_generation_id', ['checkpoint_read_token_join'], lambda c: token(c).update(generation_id=forged), None, True),
        ('token_generation_anchor_sha256', ['checkpoint_read_token_join'], lambda c: token(c).update(
            generation_anchor_sha256=foreign_hex(token(c)['generation_anchor_sha256'])), None, True),
        ('token_frontier_revision', ['checkpoint_read_token_join'], lambda c: token(c).update(
            frontier_revision=token(c)['frontier_revision'] + 1), None, True),
        ('token_frontier_sha256', ['checkpoint_read_token_join'], lambda c: token(c).update(
            frontier_sha256=foreign_hex(token(c)['frontier_sha256'])), None, True),
        ('token_index_dataset_name', ['checkpoint_read_token_join'], lambda c: token(c).update(
            index_dataset_name='event_record_index.v2@' + forged), None, True),
        ('token_redb_snapshot_id', ['checkpoint_read_token_join'], lambda c: token(c).update(
            redb_snapshot_id=token(c)['redb_snapshot_id'] + '-foreign'), None, True),
        ('anchor_source_storage_instance_id', ['checkpoint_source_storage_identity'],
         lambda c: birth(c).update(storage_instance_id=FOREIGN_STORAGE_ID), resync_birth_selection, True),
        ('frontier_source_storage_instance_id', ['checkpoint_source_storage_identity'],
         lambda c: current(c).update(storage_instance_id=FOREIGN_STORAGE_ID), resync_frontier_selection, True),
        ('row_scope_kind', ['index_row_scope_kind'], lambda c: row(c).update(scope_kind=other_scope), redigest, True),
        ('row_project_id', ['index_row_project_id'], lambda c: row(c).update(
            project_id='project-foreign' if event['project_id'] is None else None), redigest, True),
        ('row_scope_partition', ['index_row_scope_partition'], lambda c: row(c).update(
            scope_partition='project~Zm9yZWlnbg'), redigest, True),
        ('row_sequence_id', ['index_row_sequence_id'], lambda c: row(c).update(sequence_id=event['sequence_id'] + 1),
         redigest, True),
        ('row_event_id', ['index_row_event_id'], lambda c: row(c).update(
            event_id='evt_do_' + foreign_hex(event['event_id'])), redigest, True),
        ('row_event_type', ['index_row_event_type'], lambda c: row(c).update(event_type=other_family), redigest, True),
        ('row_producer_semantic_digest', ['index_row_producer_semantic_digest'], lambda c: row(c).update(
            producer_semantic_digest=foreign_hex(row(c)['producer_semantic_digest'])), redigest, True),
        ('row_idempotency_key', ['index_row_idempotency_key'], lambda c: row(c).update(
            idempotency_key=row(c)['idempotency_key'] + '-foreign'), redigest, True),
        ('row_key', ['index_row_locator_join'], lambda c: c['read'].update(row_key=re.sub(
            r':([0-9]{20}):', lambda match: f':{int(match.group(1)) + 1:020}:', c['read']['row_key'], count=1)), redigest, True),
        ('row_checkpoint_ref', ['index_row_locator_join'], lambda c: row(c)['publication_locator'].update(
            checkpoint_ref=token(c)['checkpoint_key'] + '#/generations/' + forged), redigest, True),
        ('source_event', ['index_original_source_join'], lambda c: c['read']['source_event'].update(
            observed_at_utc='1999-01-01T00:00:00Z'), None, True),
        ('source_value_sha256', ['index_original_source_join'], lambda c: c['read'].update(
            source_value_sha256=foreign_hex(c['read']['source_value_sha256'])), None, True),
        ('row_schema', ['index_row_schema'], lambda c: row(c).update(unregistered_probe='probe'), redigest, False),
        ('index_row_count', ['index_complete_row_set'], lambda c: node(c)['frontier'].update(index_row_count=2),
         redigest, True),
        ('index_row_set_sha256', ['index_complete_row_set'], lambda c: node(c)['frontier'].update(
            index_row_set_sha256=foreign_hex(node(c)['frontier']['index_row_set_sha256'])),
         lambda c: redigest(c, row_set=False), True),
        ('anchor_retained_event_prefix_sha256', ['index_source_prefix'], lambda c: node(c)['anchor'].update(
            retained_event_prefix_sha256=foreign_hex('prefix')), redigest, True),
        ('coverage_retained_event_prefix_sha256', ['index_source_prefix'], lambda c: frontier_coverage(c).update(
            retained_event_prefix_sha256=foreign_hex('prefix')), redigest, True),
        ('anchor_survivor_prefix_sha256', ['index_source_prefix'], lambda c: birth(c).update(
            manifest_survivor_prefix_sha256=foreign_hex('prefix')), resync_birth_selection, True),
        ('frontier_survivor_prefix_sha256', ['index_source_prefix'], lambda c: current(c).update(
            manifest_survivor_prefix_sha256=foreign_hex('prefix')), resync_frontier_selection, True),
        ('row_manifest_generation', ['index_birth_anchor_join'], lambda c: row(c)['publication_locator'].update(
            manifest_generation=row(c)['publication_locator']['manifest_generation'] + 1), redigest, True),
        ('row_recovery_epoch', ['index_birth_anchor_join'], lambda c: row(c)['publication_locator'].update(
            recovery_epoch=row(c)['publication_locator']['recovery_epoch'] + 1), redigest, True),
        ('row_survivor_prefix_sha256', ['index_birth_anchor_join'], lambda c: row(c)['publication_locator'].update(
            survivor_prefix_sha256=foreign_hex('prefix')), redigest, True),
        ('current_generation_missing', ['checkpoint_not_current'], lambda c: c['read']['checkpoint'].update(
            current_generation_id=forged), None, False),
        ('second_current_node', ['checkpoint_not_current'], second_current, None, False),
        ('staged_current_node', ['checkpoint_not_current'], staged, None, False),
        ('retired_at_on_current', ['checkpoint_schema'], lambda c: node(c).update(retired_at_utc='2026-11-04T00:00:00Z'),
         None, False),
        ('successor_on_current', ['checkpoint_schema'], lambda c: node(c).update(successor_generation_id=forged), None, False),
        ('empty_flag_alone', ['checkpoint_schema'], lambda c: frontier_coverage(c).update(empty_retained_source=True),
         redigest, True),
    )
    # The token's and the read's copies of the frontier selection, one member at a time. The token schema fixes the
    # two const refs, so only the read's unvalidated copy changes them.
    for holder, consts in (('token_source_selection', False), ('current_source_selection', True)):
        for field, value in read['current_source_selection'].items():
            if field in ('current_ref', 'manifest_ref') and not consts:
                continue
            other = (FOREIGN_STORAGE_ID if field == 'storage_instance_id' else value + 1 if type(value) is int
                     else value + '-foreign' if field.endswith('_ref') else foreign_hex(value))
            target = (lambda c: c['read']['read_token']['source_selection']) if holder == 'token_source_selection' else (
                lambda c: c['read']['current_source_selection'])
            changes += ((holder + '.' + field, ['checkpoint_read_token_join'],
                         lambda c, target=target, field=field, other=other: target(c).update({field: other}), None, True),)
    for name, codes, change, after, repairs in changes:
        bad = copy.deepcopy(case)
        change(bad)
        if after is not None:
            after(bad)
        yield name, bad, codes, case, repairs


def checkpoint_field_negatives(case):
    """Every single-defect checkpoint negative of the lane, by round: (round:name, case, codes, base, repairs).

    The registry the field inventory's derived rows name. DO-P1F04's segment_count adds a segment and DO-P1F05's
    null-frame, bare-null and incomplete forms remove or contradict a source, so no builder repairs them; every
    other negative changes one derived copy, which recapture_history writes back from its source.
    """
    unrepaired = {'segment_count', 'empty_source_null_frame', 'bare_null_frame', 'incomplete_coverage'}
    closed = closed_segment_case(case)
    for name, bad, code in coverage_copy_negatives(case):
        yield 'P1F04:' + name, bad, [code], case, name not in unrepaired
    for name, bad, code in sequence_copy_negatives(case):
        yield 'P1F05:' + name, bad, [code], closed if code == 'index_coverage_segment_name_last_sequence' else case, True
    for name, bad, code in frame_negatives(case):
        yield 'P1F05:' + name, bad, [code], case, name not in unrepaired
    for name, bad, codes, base, repairs in identity_copy_negatives(case):
        yield 'P1F06:' + name, bad, codes, base, repairs
    for name, bad, codes, base, repairs in join_negatives(case):
        yield 'P1F06:' + name, bad, codes, base, repairs


def checkpoint_negative_registry(case):
    return {name: codes for name, _, codes, _, _ in checkpoint_field_negatives(case)}


def p1f06_guard_errors(case):
    """The DO-P1F06 predicates alone, on a case whose checkpoint shape is valid."""
    node = checkpoint_node(case)
    coverage = node['frontier']['coverage']
    row = case['read']['row']
    return (row_event_copy_errors(case, row)[8:] + segment_identity_errors(coverage)
            + selection_copy_errors(node['anchor'], node['frontier']) + sequence_gap_errors(case['event'], coverage)
            + row_locator_copy_errors(case['event'], row, node, coverage)
            + generation_copy_errors(case['logical_payload']['storage_instance_id'], case['read']['checkpoint']['generations']))


def p1f06_guard_alone(code, case):
    """The one DO-P1F06 guard function that owns `code`, run alone."""
    node = checkpoint_node(case)
    coverage = node['frontier']['coverage']
    row = case['read']['row']
    if code.startswith('index_row_') and code.removeprefix('index_row_') in ROW_EVENT_COPY_FIELDS:
        return [x for x in row_event_copy_errors(case, row) if x == code] or row_event_copy_errors(case, row)
    for codes, run in ((SEGMENT_IDENTITY_CODES, lambda: segment_identity_errors(coverage)),
                       (SELECTION_COPY_CODES, lambda: selection_copy_errors(node['anchor'], node['frontier'])),
                       (SEQUENCE_GAP_CODES, lambda: sequence_gap_errors(case['event'], coverage)),
                       (ROW_LOCATOR_CODES, lambda: row_locator_copy_errors(case['event'], row, node, coverage)),
                       (GENERATION_COPY_CODES, lambda: generation_copy_errors(
                           case['logical_payload']['storage_instance_id'], case['read']['checkpoint']['generations']))):
        if code in codes:
            return run()
    raise KeyError(code)


# Wrong representations of each new guard's copy: (code, path, forms). Paths use '*' for the current generation.
P1F06_TYPE_FORMS = (
    ('index_row_payload_sha256', 'read.row.payload_sha256', ('null', 'upper', 'trailing_lf')),
    ('index_row_correlation_id', 'read.row.correlation_id', ('null', 'int', 'trailing_lf')),
    ('index_row_causation_event_id', 'read.row.causation_event_id', ('int', 'bool', 'null_string')),
    ('index_row_persisted_at_utc', 'read.row.persisted_at_utc', ('null', 'int', 'trailing_lf')),
    ('index_row_redaction_profile', 'read.row.redaction_profile', ('null', 'trailing_lf')),
    ('index_row_source_schema_id', 'read.row.source_schema_id', ('null', 'trailing_lf')),
    ('index_row_source_schema_version', 'read.row.source_schema_version', ('int', 'trailing_lf', 'null_string')),
    ('index_row_projector_replay_only', 'read.row.projector_replay_only', ('string', 'int', 'null')),
    ('index_row_source_segment_generation', 'read.row.source_locator.segment_generation', ('float', 'string', 'bool', 'null')),
    ('index_row_source_segment_name', 'read.row.source_locator.segment_name', ('null', 'trailing_lf', 'unpadded')),
    ('index_row_source_byte_offset', 'read.row.source_locator.byte_offset', ('float', 'string', 'bool', 'null')),
    ('index_row_source_sequence_id', 'read.row.source_locator.sequence_id', ('float', 'string', 'bool', 'null')),
    ('index_row_translation_ref', 'read.row.publication_locator.compaction_translation_manifest_ref', ('empty', 'null_string')),
    ('index_coverage_segment_name_generation', 'read.checkpoint.generations.*.frontier.coverage.last_frame.segment_name',
     ('null', 'trailing_lf', 'padded_generation')),
    ('index_anchor_selected_segment_generation', 'read.checkpoint.generations.*.anchor.source_selection.selected_segment_generation',
     ('float', 'string', 'bool', 'null')),
    ('index_frontier_selected_segment_generation', 'read.checkpoint.generations.*.frontier.source_selection.selected_segment_generation',
     ('float', 'string', 'bool', 'null')),
    ('index_frontier_current_bytes_sha256', 'read.checkpoint.generations.*.frontier.source_selection.current_bytes_sha256',
     ('null', 'upper', 'trailing_lf')),
    ('index_frontier_recovery_epoch', 'read.checkpoint.generations.*.frontier.source_selection.recovery_epoch',
     ('float', 'string', 'bool', 'null')),
    ('index_frontier_excluded_ranges_sha256', 'read.checkpoint.generations.*.frontier.source_selection.excluded_ranges_sha256',
     ('null', 'upper', 'trailing_lf')),
    ('index_frontier_retired_inputs_sha256', 'read.checkpoint.generations.*.frontier.source_selection.retired_inputs_sha256',
     ('null', 'upper', 'trailing_lf')),
    ('index_anchor_sequence_gaps_sha256', 'read.checkpoint.generations.*.anchor.sequence_gaps_sha256', ('null', 'upper', 'trailing_lf')),
    ('index_generation_id', 'read.checkpoint.generations.*.generation_id', ('null', 'upper', 'trailing_lf')),
    ('index_generation_dataset_name', 'read.checkpoint.generations.*.index_dataset_name', ('null', 'trailing_lf')),
)


def type_form(value, form):
    if form == 'int':
        return 5
    if form == 'null_string':
        return 'null'
    if form == 'empty':
        return ''
    if form == 'unpadded':
        return re.sub(r'^(seg-[0-9]{6,}-)([0-9]{20})', lambda match: match.group(1) + str(int(match.group(2))), value)
    if form == 'padded_generation':
        # The generation field padded to seven digits: the same number written another way, and grammar-valid.
        return re.sub(r'^seg-([0-9]{6,})-', lambda match: 'seg-0' + match.group(1) + '-', value)
    if form == 'upper':
        return value[:4] + value[4:].upper() if value.startswith('eig_') else value.upper()
    return wrong_form(value, form)


def path_tokens(path):
    return [token for token in re.split(r'\.|(?=\[\])', path) if token]


def path_holder(case, path):
    """The container and key of `path` in the case (the current generation for '*', item 0 for '[]')."""
    tokens = path_tokens(path)
    target = case
    for token in tokens[:-1]:
        target = target[0] if token == '[]' else target[case['read']['checkpoint']['current_generation_id']] if token == '*' else target[token]
    last = tokens[-1]
    return target, (0 if last == '[]' else last)


def p1f06_type_form_checks(fixtures, schema, owner_module):
    """Exact type: each new guard alone refuses every other representation of its copy; through checkpoint_errors the
    strict checkpoint schema refuses what it does not admit, the weaker row schema adds `index_row_schema` beside the
    guard's own code, and an integral float makes the binding codec raise (DO-P1F4-S1, part 2)."""
    root, formats = owner_module.ROOT, owner_module.UTC_FORMAT
    v = selected_validators(root, formats)
    row_validator = StrictValidator(index_row_schema(root), format_checker=formats)
    checks = 0
    for case in fixtures['event_cases']:
        for code, path, forms in P1F06_TYPE_FORMS:
            for form in forms:
                bad = copy.deepcopy(case)
                holder, field = path_holder(bad, path)
                value = type_form(holder[field], form)
                holder[field] = value
                if code == 'index_coverage_segment_name_generation':
                    # Every copy of the name carries the form, so the generation field is the only defect.
                    coverage = frontier_coverage(bad)
                    coverage['segments'][0]['segment_name'] = bad['read']['row']['source_locator']['segment_name'] = value
                assert p1f06_guard_alone(code, bad) == [code], (case['case_id'], path, form, p1f06_guard_alone(code, bad))
                checks += 1
                try:
                    redigest(bad)
                except (TypeError, ValueError):
                    assert form == 'float', (case['case_id'], path, form)
                    try:
                        checkpoint_errors(bad, root, formats)
                    except TypeError:
                        checks += 1
                        continue
                    raise AssertionError(('float_copy_digested', case['case_id'], path))
                read = bad['read']
                if list(v['checkpoint'].iter_errors(read['checkpoint'])) or list(v['read_token'].iter_errors(read['read_token'])):
                    expected = ['checkpoint_schema']
                else:
                    expected = sorted([code] + (['index_row_schema'] if list(row_validator.iter_errors(read['row'])) else []))
                assert sorted(checkpoint_errors(bad, root, formats)) == expected, (case['case_id'], path, form)
                checks += 1
                if expected != ['checkpoint_schema']:
                    assert sorted(historical_read_errors(bad, schema, owner_module)) == expected, (case['case_id'], path, form)
                    checks += 1
    return checks


def migrated_row_control(case):
    """Builder control: an original migrated from EventEnvelopeV1 (Case L-5's migration formula) is projected with the
    migrated-from source schema, and recapture_history derives it."""
    control = copy.deepcopy(case)
    control['event']['migration'] = {'migrated_from_schema_id': 'pm.event.envelope_v1', 'migrated_from_schema_version': None,
        'migration_id': 'event-envelope-v1-to-event-record-v2@1', 'compatibility_event_type': control['event']['event_type']}
    return recapture_history(control)


def identity_copy_checks(fixtures, schema, owner_module):
    """DO-P1F06: every positive agrees with every new predicate and is a builder fixpoint; the compaction and gap
    controls are accepted; each new predicate's negative and each backfilled join negative is refused with exactly its
    codes; every repairable negative of every round is restored by the builder."""
    root, formats = owner_module.ROOT, owner_module.UTC_FORMAT
    checks = 0
    for key in POSITIVE_KEYS:
        for case in fixtures[key]:
            assert not p1f06_guard_errors(case), (key, case['case_id'], p1f06_guard_errors(case))
            assert typed_tree(recapture_history(copy.deepcopy(case))) == typed_tree(case), (key, case['case_id'], 'builder_fixpoint')
            checks += 2
            for control in (compaction_control(case), compaction_control(case, translated_row=True), gap_control(case)):
                assert checkpoint_errors(control, root, formats) == [], (key, case['case_id'], 'control')
                assert historical_read_errors(control, schema, owner_module) == [], (key, case['case_id'], 'control')
                checks += 2
            for name, bad, codes, _, _ in identity_copy_negatives(case):
                assert checkpoint_errors(bad, root, formats) == codes, (key, case['case_id'], name)
                assert historical_read_errors(bad, schema, owner_module) == codes, (key, case['case_id'], name)
                checks += 2
                if key == 'event_cases':
                    assert recover_original(bad, schema, owner_module) == UNVERIFIED_ORIGINAL, (case['case_id'], name)
                    checks += 1
            for name, bad, codes, _, _ in join_negatives(case):
                assert checkpoint_errors(bad, root, formats) == codes, (key, case['case_id'], name)
                checks += 1
                if key == 'event_cases':
                    assert historical_read_errors(bad, schema, owner_module) == codes, (case['case_id'], name)
                    checks += 1
    for case in fixtures['event_cases']:
        for name, bad, codes, base, repairs in checkpoint_field_negatives(case):
            if repairs:
                assert typed_tree(recapture_history(copy.deepcopy(bad))) == typed_tree(base), (case['case_id'], name, 'builder_repair')
                checks += 1
        migrated = migrated_row_control(case)
        assert migrated['read']['row']['source_schema_id'] == 'pm.event.envelope_v1'
        assert migrated['read']['row']['source_schema_version'] is None
        assert checkpoint_errors(migrated, root, formats) == [], (case['case_id'], 'migrated_row')
        checks += 1
    checks += p1f06_type_form_checks(fixtures, schema, owner_module)
    checks += checkpoint_inventory_checks(fixtures, owner_module)
    return checks


# ---- The field inventory ---------------------------------------------------------------------------------------

INVENTORY_PATH = 'Plans/orchestrator_checkpoint_field_inventory.json'
BOUND_KEYWORDS = ('type', 'const', 'enum', 'pattern', 'format', 'minimum', 'maximum', 'minLength', 'maxLength',
                  'minItems', 'maxItems', 'uniqueItems', 'minProperties', 'maxProperties')
CHECKPOINT_CODES = (
    ('checkpoint_schema', 'checkpoint_storage_identity', 'checkpoint_not_current', 'checkpoint_read_token_join',
     'checkpoint_source_storage_identity')
    + tuple('index_row_' + k for k in ROW_EVENT_COPY_FIELDS)
    + ('index_row_locator_join', 'index_original_source_join', 'index_row_schema', 'index_complete_row_set',
       'index_source_prefix', 'index_birth_anchor_join', 'index_coverage_last_frame_null',
       'index_complete_source_coverage', 'index_coverage_frame_last_event_id')
    + COVERAGE_COPY_CODES + SEQUENCE_COPY_CODES + SEGMENT_IDENTITY_CODES + SELECTION_COPY_CODES
    + SEQUENCE_GAP_CODES + ROW_LOCATOR_CODES + GENERATION_COPY_CODES)
GUARD_FUNCTIONS = ('checkpoint_errors', 'row_event_copy_errors', 'coverage_copy_errors', 'sequence_copy_errors',
                   'segment_identity_errors', 'selection_copy_errors', 'sequence_gap_errors', 'row_locator_copy_errors',
                   'generation_copy_errors', 'checkpoint_schema')


def checkpoint_value_schemas(root):
    """The schemas of the values the lane's checkpoint reads hold, by value path. The checkpoint schema inlines every
    structure (no $ref); the row is the registry's event_record_index value; the read's current source selection is
    the checkpoint schema's source_selection."""
    document = selected_documents(root)['event_record_index_checkpoint']
    return {'read.checkpoint': document['$defs']['checkpoint'], 'read.read_token': document['$defs']['read_token'],
            'read.current_source_selection': document['$defs']['source_selection'],
            'read.row': index_row_schema(root)}


def schema_fields(values, envelope_keys):
    """Regenerate the field list from the schemas: {path: bound}, plus closure errors.

    A field is every property at every depth whose schema is not a closed object: leaves, nullable objects (the
    null is a value), arrays and maps with their items and keys. A closed object's members are fields; the walk
    requires each value object to be closed (additionalProperties false, every listed property required), so no
    instance can hold a field outside the list, and requires each conditional branch to name only declared
    properties. `bound` is the sorted list of constraint-keyword sets the schema puts on that path.
    The read's other keys (taken from the instances) are leaf fields.
    """
    bounds, containers, declared, conditional_names, errors = {}, {}, {}, {}, []

    def visit(node, path, conditional):
        if not isinstance(node, dict):
            return
        constraint = {k: node[k] for k in BOUND_KEYWORDS if k in node}
        if 'patternProperties' in node:
            constraint['patternProperties'] = sorted(node['patternProperties'])
            if node.get('additionalProperties') is not False:
                errors.append('inventory_open_object:' + path)
        if constraint:
            bounds.setdefault(path, {})[json.dumps(constraint, sort_keys=True)] = constraint
        properties = node.get('properties')
        if properties is not None:
            if conditional:
                conditional_names.setdefault(path, set()).update(properties)
            else:
                if node.get('additionalProperties') is not False or set(node.get('required', [])) != set(properties):
                    errors.append('inventory_open_object:' + path)
                declared.setdefault(path, set()).update(properties)
                containers.setdefault(path, []).append(True)
            for name, child in properties.items():
                visit(child, path + '.' + name, conditional)
        elif not conditional:
            containers.setdefault(path, []).append(False)
        if 'patternProperties' in node:
            for pattern, child in node['patternProperties'].items():
                key = {'pattern': pattern}
                bounds.setdefault(path + '{key}', {})[json.dumps(key, sort_keys=True)] = key
                containers.setdefault(path + '{key}', []).append(False)
                visit(child, path + '.*', conditional)
        if isinstance(node.get('items'), dict):
            visit(node['items'], path + '[]', conditional)
        for keyword in ('anyOf', 'oneOf'):
            for branch in node.get(keyword, []):
                visit(branch, path, conditional)
        for branch in node.get('allOf', []):
            visit(branch, path, True)
        for keyword in ('if', 'then', 'else'):
            if keyword in node:
                visit(node[keyword], path, True)

    for path, node in values.items():
        visit(node, path, False)
    for path, names in conditional_names.items():
        for name in sorted(names - declared.get(path, set())):
            errors.append('inventory_conditional_undeclared:' + path + '.' + name)
    fields = {}
    for path, kinds in containers.items():
        if path in values or all(kinds):  # a closed object in every branch: a container, its members are the fields
            continue
        fields[path] = [bounds.get(path, {})[k] for k in sorted(bounds.get(path, {}))]
    for key in sorted(envelope_keys):
        path = 'read.' + key
        if path not in values:
            fields[path] = []
    return fields, sorted(set(errors))


def checkpoint_inventory_errors(inventory, fields, closure_errors, registry, module):
    """Fail on a field with no row, a row with no field, a stale bound and an incomplete row."""
    errors = list(closure_errors)
    rows = {}
    for row in inventory.get('rows', []):
        if row.get('path') in rows:
            errors.append('inventory_duplicate_row:' + str(row.get('path')))
        rows[row.get('path')] = row
    errors += ['inventory_unrowed_field:' + path for path in sorted(set(fields) - set(rows))]
    errors += ['inventory_stale_row:' + str(path) for path in sorted(set(rows) - set(fields), key=str)]
    for path in sorted(set(fields) & set(rows)):
        row = rows[path]
        if typed_tree(row.get('bound')) != typed_tree(fields[path]):
            errors.append('inventory_stale_bound:' + path)
        guards = row.get('guards') if isinstance(row.get('guards'), list) else []
        if row.get('class') == 'derived':
            if not row.get('source'):
                errors.append('inventory_derived_without_source:' + path)
            if not guards:
                errors.append('inventory_derived_without_guard:' + path)
            if row.get('builder') not in ('recapture_history', None) or (row.get('builder') is None and not row.get('builder_reason')):
                errors.append('inventory_builder:' + path)
        elif row.get('class') == 'free':
            if not row.get('reason'):
                errors.append('inventory_free_without_reason:' + path)
            if not isinstance(row.get('refused_forms'), list) or (not row['refused_forms'] and fields[path]):
                errors.append('inventory_free_without_refused_form:' + path)
            elif row['refused_forms'] and row.get('refused_code') not in (
                    'checkpoint_schema', 'index_row_schema', 'checkpoint_read_token_join'):
                errors.append('inventory_free_refused_code:' + path)
        else:
            errors.append('inventory_row_class:' + path)
        if row.get('class') in ('derived', 'free'):
            for guard in guards:
                if guard.get('function') not in GUARD_FUNCTIONS or (guard['function'] != 'checkpoint_schema'
                                                                   and not callable(getattr(module, guard['function'], None))):
                    errors.append('inventory_unknown_guard:' + path)
                if guard.get('code') not in CHECKPOINT_CODES:
                    errors.append('inventory_unknown_code:' + path)
                if guard.get('code') not in registry.get(guard.get('negative'), ()):
                    errors.append('inventory_unproved_guard:' + path)
    return errors


def inventory_carrier(case, path):
    """A schema-valid holder for a free field under a container the positives leave empty or null."""
    node = checkpoint_node(case)
    if '.translation.' in path:
        node['translation'] = translation_value(case)
    elif '.sequence_gaps[].' in path:
        frontier_coverage(case)['sequence_gaps'] = [gap_value(case, 1, 1)]
    elif path.endswith('.hold_refs[]'):
        node['hold_refs'] = ['hold:carrier']


def checkpoint_inventory_checks(fixtures, owner_module):
    """The committed inventory matches the field list regenerated from the schemas; every derived row names a guard
    whose negative is refused with that code; every free row's refused forms are refused. Then the checker's own
    negatives: a removed row, an added schema field, an added read key, a stale row, a changed bound, an open object,
    an unproved guard and a free row without a reason each fail it."""
    root, formats = owner_module.ROOT, owner_module.UTC_FORMAT
    module = sys.modules[__name__]
    inventory = json.loads((root / INVENTORY_PATH).read_text())
    positives = [case for key in POSITIVE_KEYS for case in fixtures[key]]
    envelope = set().union(*(case['read'].keys() for case in positives))
    values = checkpoint_value_schemas(root)
    fields, closure = schema_fields(values, envelope)
    registry = checkpoint_negative_registry(fixtures['event_cases'][0])
    errors = checkpoint_inventory_errors(inventory, fields, closure, registry, module)
    assert not errors, ('checkpoint_field_inventory', errors[:20])
    checks = 1
    totals = {'fields': len(fields), 'derived': sum(r['class'] == 'derived' for r in inventory['rows']),
              'free': sum(r['class'] == 'free' for r in inventory['rows'])}
    assert inventory['totals'] == totals, ('inventory_totals', inventory['totals'], totals)
    checks += 1
    # A row the builder derives names at least one negative the builder repairs (identity_copy_checks proves each
    # repair on every event positive), so the builder is shown to write that field from its source.
    repairable = {name for name, _, _, _, repairs in checkpoint_field_negatives(fixtures['event_cases'][0]) if repairs}
    for row in inventory['rows']:
        if row['class'] == 'derived' and row['builder'] == 'recapture_history':
            assert any(guard['negative'] in repairable for guard in row['guards']), ('inventory_builder_unproved', row['path'])
            checks += 1
    # Each free row's refused forms, on every event positive.
    for case in fixtures['event_cases']:
        for row in inventory['rows']:
            if row['class'] != 'free':
                continue
            for form in row['refused_forms']:
                bad = copy.deepcopy(case)
                inventory_carrier(bad, row['path'])
                if row['path'].endswith('{key}'):
                    generations = bad['read']['checkpoint']['generations']
                    bad['read']['checkpoint']['generations'] = {form: value for value in generations.values()}
                else:
                    holder, field = path_holder(bad, row['path'])
                    holder[field] = copy.deepcopy(form)
                if row['refused_code'] != 'checkpoint_schema':
                    redigest(bad)
                assert checkpoint_errors(bad, root, formats) == [row['refused_code']], (case['case_id'], row['path'], form)
                checks += 1
    # The checker's own negatives.
    def fails(expected, inventory=inventory, values=values, envelope=envelope, registry=registry):
        found_fields, found_closure = schema_fields(values, envelope)
        found = checkpoint_inventory_errors(inventory, found_fields, found_closure, registry, module)
        assert expected in found, (expected, found[:5])
        return 1
    for index, row in enumerate(inventory['rows']):
        reduced = dict(inventory, rows=inventory['rows'][:index] + inventory['rows'][index + 1:])
        checks += fails('inventory_unrowed_field:' + row['path'], inventory=reduced)
    for value_path, structure in (('read.checkpoint', ('generations', '*', 'frontier', 'coverage')),
                                  ('read.read_token', ()), ('read.current_source_selection', ()), ('read.row', ('source_locator',))):
        grown = copy.deepcopy(values)
        target = grown[value_path]
        for name in structure:
            target = target['patternProperties'][next(iter(target['patternProperties']))] if name == '*' else target['properties'][name]
        target['properties']['inventory_probe'] = {'type': 'string'}
        target['required'] = target['required'] + ['inventory_probe']
        path = value_path + ''.join('.' + name for name in structure) + '.inventory_probe'
        checks += fails('inventory_unrowed_field:' + path, values=grown)
    checks += fails('inventory_unrowed_field:read.inventory_probe', envelope=envelope | {'inventory_probe'})
    stale = dict(inventory, rows=inventory['rows'] + [dict(inventory['rows'][0], path='read.checkpoint.withdrawn_field')])
    checks += fails('inventory_stale_row:read.checkpoint.withdrawn_field', inventory=stale)
    changed = copy.deepcopy(values)
    changed['read.read_token']['properties']['frontier_sha256']['pattern'] = '^[0-9a-f]{40}$'
    checks += fails('inventory_stale_bound:read.read_token.frontier_sha256', values=changed)
    opened = copy.deepcopy(values)
    opened['read.row']['properties']['source_locator'].pop('additionalProperties')
    checks += fails('inventory_open_object:read.row.source_locator', values=opened)
    derived = next(r for r in inventory['rows'] if r['class'] == 'derived')
    unproved = dict(inventory, rows=[dict(r, guards=[dict(r['guards'][0], negative='P1F06:no_such_negative')])
                                     if r is derived else r for r in inventory['rows']])
    checks += fails('inventory_unproved_guard:' + derived['path'], inventory=unproved)
    free = next(r for r in inventory['rows'] if r['class'] == 'free')
    reasonless = dict(inventory, rows=[dict(r, reason='') if r is free else r for r in inventory['rows']])
    checks += fails('inventory_free_without_reason:' + free['path'], inventory=reasonless)
    return checks


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


def refresh_sequence_copies(case):
    """DO-P1F05: write every anchor, frontier and row copy of the event's sequence number from the event.

    One-event model: one segment, which the last frame names; the name keeps its generation and its form.
    """
    node = checkpoint_node(case)
    coverage = node['frontier']['coverage']
    assert len(coverage['segments']) == 1 and coverage['last_frame'] is not None, 'one-event model'
    sequence = case['event']['sequence_id']
    for holder in (coverage, node['anchor']):
        holder.update(first_retained_sequence_id=sequence, through_sequence_id=sequence, retained_event_count=1)
    coverage['last_frame']['last_sequence_id'] = sequence
    coverage['segments'][0].update(first_sequence_id=sequence, last_sequence_id=sequence, retained_event_count=1)
    derive_segment_name(case)
    case['read']['row']['sequence_id'] = sequence
    return case


def derive_segment_name(case):
    """DO-P1F06: the one segment's name from its sources (storage-plan.md:460-461): the last frame's segment
    generation in six or more digits, the event's sequence as first (and, closed, last) field, and the form its state
    gives (`.active` for `active`, `.seglog` otherwise). It used to keep the old name's generation field and form."""
    coverage = frontier_coverage(case)
    segment, frame = coverage['segments'][0], coverage['last_frame']
    sequence = case['event']['sequence_id']
    name = f"seg-{frame['segment_generation']:06}-{sequence:020}" + (
        '.active' if segment['state'] == 'active' else f'-{sequence:020}.seglog')
    segment['segment_name'] = frame['segment_name'] = case['read']['row']['source_locator']['segment_name'] = name
    return case


def refresh_identity_copies(case):
    """DO-P1F06: write every derived copy that DO-P1F04's and DO-P1F05's refreshes do not, each from its source.

    Called by recapture_history after the event, sequence, byte and prefix copies are written and before the row set,
    anchor and frontier are digested. The sources are the inventory's (`Plans/orchestrator_checkpoint_field_inventory.json`):
    the payload's storage instance, the last frame's segment generation, the segment's scan start, the anchor's
    birth selection, the event, and the generation recipe. One-event model: one current node, one segment.
    """
    event, read = case['event'], case['read']
    cp, row, token = read['checkpoint'], read['row'], read['read_token']
    node = checkpoint_node(case)
    frontier = node['frontier']
    coverage = frontier['coverage']
    frame, segment = coverage['last_frame'], coverage['segments'][0]
    birth, current = node['anchor']['source_selection'], frontier['source_selection']
    storage_id = case['logical_payload']['storage_instance_id']
    cp['storage_instance_id'] = birth['storage_instance_id'] = current['storage_instance_id'] = storage_id
    # The frame is the event's, at the segment's scan start, in the segment the selections select.
    segment['segment_generation'] = frame['segment_generation']
    frame['byte_offset'] = segment['scan_start_offset']
    birth['selected_segment_generation'] = current['selected_segment_generation'] = frame['segment_generation']
    for field in ('current_bytes_sha256', 'recovery_epoch', 'excluded_ranges_sha256', 'retired_inputs_sha256'):
        current[field] = birth[field]
    node['anchor']['sequence_gaps_sha256'] = EMPTY_GAPS_SHA256
    coverage['empty_retained_source'] = False
    frontier['index_row_count'] = 1
    derive_segment_name(case)
    # The index row's copies of the event and of the frame cursor, and its birth triple.
    row.update(expected_row_copies(case))
    row['source_locator'].update(segment_generation=frame['segment_generation'], segment_name=frame['segment_name'],
                                 byte_offset=segment['scan_start_offset'], sequence_id=event['sequence_id'])
    publication = row['publication_locator']
    publication.update(manifest_generation=birth['manifest_generation'], recovery_epoch=birth['recovery_epoch'],
                       survivor_prefix_sha256=birth['manifest_survivor_prefix_sha256'])
    # A translation exists only on a compaction shadow; its target selection is this generation's birth selection.
    if node['origin'] != 'compaction_shadow':
        node['translation'] = None
    if node['translation'] is None:
        publication['compaction_translation_manifest_ref'] = None
    else:
        node['translation']['target_selection_sha256'] = binding_digest(birth)
    token.update(frontier_revision=frontier['publication_revision'], redb_snapshot_id=read['snapshot_id'])
    return rekey(case)


def rekey(case, generation_id=None):
    """Give the current generation the recipe's id (or, for a forged-identity negative, `generation_id`) and write
    every copy of it: the map key, current_generation_id, the node's id and dataset name, the read token's
    storage instance, checkpoint key and ref, generation id and dataset name, and the row's checkpoint ref."""
    read = case['read']
    cp, token, row = read['checkpoint'], read['read_token'], read['row']
    node = checkpoint_node(case)
    storage_id = case['logical_payload']['storage_instance_id']
    generation_id = generation_id or generation_identity(storage_id, node)
    old = cp['current_generation_id']
    cp['generations'] = {generation_id if k == old else k: v for k, v in cp['generations'].items()}
    cp['current_generation_id'] = node['generation_id'] = generation_id
    node['index_dataset_name'] = 'event_record_index.v2@' + generation_id
    key = 'event_record_index_checkpoint.v1:' + storage_id
    token.update(storage_instance_id=storage_id, checkpoint_key=key, checkpoint_ref=key + '#/generations/' + generation_id,
                 generation_id=generation_id, index_dataset_name='event_record_index.v2@' + generation_id)
    row['publication_locator']['checkpoint_ref'] = token['checkpoint_ref']
    return case


def recapture_history(case):
    """Refresh copied Storage observations after changing a synthetic original."""
    event = case['event']; read = case['read']; row = read['row']
    node = read['checkpoint']['generations'][read['checkpoint']['current_generation_id']]
    frontier = node['frontier']
    # DO-P1F04: the frontier's four copies of the event's bytes, before the frontier is digested below.
    coverage = frontier['coverage']
    assert len(coverage['segments']) == 1, 'one-event model: one segment'
    data = packed(event)
    coverage['last_frame']['frame_end_offset'] = len(data)
    segment = coverage['segments'][0]
    segment['scanned_through_offset'] = segment['source_durable_end_offset'] = len(data)
    segment['source_durable_bytes_sha256'] = hashlib.sha256(data).hexdigest()
    refresh_sequence_copies(case)
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
    refresh_identity_copies(case)
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
    checks += coverage_copy_checks(fixtures, schema, owner_module)
    checks += sequence_copy_checks(fixtures, schema, owner_module)
    checks += identity_copy_checks(fixtures, schema, owner_module)
    return checks
