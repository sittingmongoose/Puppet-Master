"""DO append/retry/transport/read relational oracles. Native authority NOT_RUN.

Fixtures assume a verified source adapter and an admitted generic publication.
They test joins, not native CRC, custody authentication, redb CAS or durability.
"""
import base64
import collections
import copy
from decimal import Decimal
import hashlib
import json
import re
import sys
from functools import lru_cache
from pathlib import Path

import blake3
import msgpack
from jsonschema import Draft202012Validator, FormatChecker, ValidationError, validators
from referencing import Registry, Resource
from referencing.jsonschema import DRAFT202012
from referencing.exceptions import Unresolvable

from pm_event_index_binding import binding_digest
from pm_projects_refresh_contracts import semantic_hash, scope_failures, typed_tree
from pm_event_numbers import (
    APP_PHYSICAL, EVENT_VALUE, PRODUCER_FIELDS, FrozenRecipe, JsonNumber, OriginalBinding, OriginalCustody,
    RecipeTuple, Refusal, RetainedDispatcher, decode_storage_value, current_integer, current_integer_token, loads_current_json,
    producer_semantic_digest, qualified_jcs, storage_uint64, storage_value_bytes)
from pm_event_datetime import EVENT_RECORD, STORAGE_UTC_Z, date_time
import pm_orchestrator_event_guards as guards


SEMANTIC_FIELDS = (
    'event_type', 'scope_kind', 'project_id', 'thread_id', 'run_id', 'node_id',
    'attempt_id', 'actor_ref', 'requested_account_ref', 'effective_account_ref',
    'occurred_at_utc', 'producer_sequence_id', 'correlation_id', 'causation_event_id',
    'parent_event_id', 'idempotency_key', 'payload_schema_id', 'payload', 'payload_ref',
    'redaction_profile', 'migration',
)
# CV-317: the producer projection is the shared helper's, field for field.
assert SEMANTIC_FIELDS == PRODUCER_FIELDS
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


@UTC_FORMAT.checks('date-time', raises=Refusal)
def event_record_date_time(value):
    """CV-1101 (sweep part 2B): the shared date-time predicate, `pm_event_datetime.date_time` with the EventRecord
    profile, at every `format: date-time` this lane validates. It replaces the lane's own uppercase-Z grammar.

    As in the shared `format_checker`, every value the validator treats as a string reaches the predicate (a str
    subclass refuses, `date_time_type`); a non-string is left to `type`. The original string is never rewritten.
    Storage-assigned fields take the stricter CV-253 profile on top of this (`storage_timestamp_errors`).
    """
    return True if not isinstance(value, str) else date_time(value, profile=EVENT_RECORD) == value


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

# CV-253 / CV-1101 (sweep part 2B): Storage-assigned `observed_at_utc` and `persisted_at_utc` take the strict
# `storage_utc_z` profile. Among the resources this lane validates, `Plans/event_datetime_inventory.json` classifies
# exactly three Storage nodes: the EventRecord envelope and its frozen 1.0.0 compatibility reader
# (`Plans/event_record.schema.json`, classification EventRecord) and the event_record_index row
# (`Plans/storage_value_registry.json` /families/8/value_schema, classification event_record_index). The validators
# for those two records are wrapped below; `storage_profile_sites_errors` checks the inventory still says so.
STORAGE_TIMESTAMP_FIELDS = ('observed_at_utc', 'persisted_at_utc')


def storage_timestamp_errors(record):
    """Each Storage timestamp the record holds as a string that `date_time(..., profile=STORAGE_UTC_Z)` refuses."""
    if type(record) is not dict:
        return []
    errors = []
    for field in STORAGE_TIMESTAMP_FIELDS:
        if field in record and isinstance(record[field], str):
            try:
                date_time(record[field], profile=STORAGE_UTC_Z)
            except Refusal as refusal:
                errors.append(field + ':' + refusal.reason)
    return errors


class StorageIntegerValidator:
    """SP-1100 / CV-1100 (sweep part 2B, DO-P1F4-S1): every integer slot of a Storage record (the SP-278 checkpoint,
    read token and index row) is an exact uint64 through the shared `current_integer`, inside the schema verdict.
    JSON Schema's `integer` admits an integral float such as 1344.0, which SP-278's binding codec cannot encode; this
    refuses it at the schema boundary, with that record's own schema code, before any binding digest is taken."""

    def __init__(self, inner, node, defs):
        self.inner, self.node, self.defs = inner, node, defs

    def iter_errors(self, instance):
        yield from self.inner.iter_errors(instance)
        for reason in integer_slot_errors(self.node, instance, self.defs, storage=True):
            yield ValidationError('storage_uint64 ' + reason)

    def is_valid(self, instance):
        return next(iter(self.iter_errors(instance)), None) is None


class StorageRecordValidator:
    """A record validator plus CV-253's Storage profile at the record's own observed/persisted fields."""

    def __init__(self, inner):
        self.inner = inner

    def iter_errors(self, instance):
        yield from self.inner.iter_errors(instance)
        for error in storage_timestamp_errors(instance):
            yield ValidationError('storage_utc_z ' + error)

    def is_valid(self, instance):
        return next(iter(self.iter_errors(instance)), None) is None


# ---- CV-1100 / SP-1100 number adoption (sweep part 2B) ---------------------------------------------------------
# The lane's blanket walk (every number anywhere refused unless RFC 8785 accepted it and an integral value was an int)
# is gone. Current inputs are checked where their owners declare them: `current_integer` at every schema integer slot
# with that slot's own bounds, and the CV-317 producer projection and the identity preimage qualified by the shared
# `qualified_jcs` before any effect. Fractional numbers keep the owner's `number` type; Storage uint64 metadata uses
# `storage_uint64`; retained originals never pass through a current gate (their recipe is SP-1101's).
PLANS = Path(__file__).resolve().parents[1] / 'Plans'
UINT64_MAX = (1 << 64) - 1


@lru_cache(maxsize=1)
def payload_definitions():
    return json.loads((PLANS / 'orchestrator_event_payloads.schema.json').read_text())['$defs']


@lru_cache(maxsize=1)
def envelope_document():
    return json.loads((PLANS / 'event_record.schema.json').read_text())


def numeric_value(value):
    """A JSON number as this lane holds one: int, float, an exact Decimal carrier or a raw token. Not a bool."""
    return type(value) in (int, float, JsonNumber) or isinstance(value, Decimal)


def declares_integer(node):
    kind = node.get('type') if type(node) is dict else None
    return kind == 'integer' or (type(kind) is list and 'integer' in kind and 'number' not in kind)


def integer_bounds(node):
    minimum, maximum = node.get('minimum'), node.get('maximum')
    minimum = minimum if type(minimum) is int else None
    maximum = maximum if type(maximum) is int else None
    if type(node.get('exclusiveMinimum')) is int:
        low = node['exclusiveMinimum'] + 1
        minimum = low if minimum is None else max(minimum, low)
    if type(node.get('exclusiveMaximum')) is int:
        high = node['exclusiveMaximum'] - 1
        maximum = high if maximum is None else min(maximum, high)
    if type(node.get('const')) is int:
        minimum = maximum = node['const']
    return minimum, maximum


def integer_slots(node, value, defs, path=()):
    """Every present JSON number at a schema-declared integer slot: (path, value, minimum, maximum).

    Follows local `$ref`, `allOf`, the first integer branch of `anyOf`/`oneOf` (a nullable integer is
    `anyOf: [integer, null]`), `properties` and `items`. A non-number at an integer slot is the schema's `type` defect,
    not a number one, so it is left there.
    """
    if type(node) is not dict:
        return
    ref = node.get('$ref')
    if type(ref) is str and ref.startswith('#/$defs/'):
        yield from integer_slots(defs.get(ref[len('#/$defs/'):]), value, defs, path)
    for branch in node.get('allOf') or ():
        yield from integer_slots(branch, value, defs, path)
    for keyword in ('anyOf', 'oneOf'):
        branches = [b for b in node.get(keyword) or () if type(b) is dict]
        integer_branch = next((b for b in branches if declares_integer(b)), None)
        if integer_branch is not None and numeric_value(value):
            yield from integer_slots(integer_branch, value, defs, path)
        elif type(value) is dict:
            for branch in branches:
                if branch.get('type') == 'object' or 'properties' in branch:
                    yield from integer_slots(branch, value, defs, path)
    if declares_integer(node) and numeric_value(value):
        minimum, maximum = integer_bounds(node)
        yield path, value, minimum, maximum
    if type(value) is dict:
        properties = node.get('properties') if type(node.get('properties')) is dict else {}
        patterns = node.get('patternProperties') if type(node.get('patternProperties')) is dict else {}
        for key, child in properties.items():
            if key in value:
                yield from integer_slots(child, value[key], defs, path + (key,))
        for key in value:
            matched = [child for pattern, child in patterns.items() if re.search(pattern, key)]
            for child in matched:
                yield from integer_slots(child, value[key], defs, path + (key,))
            if key not in properties and not matched and type(node.get('additionalProperties')) is dict:
                yield from integer_slots(node['additionalProperties'], value[key], defs, path + (key,))
    if type(value) is list and type(node.get('items')) is dict:
        for index, child in enumerate(value):
            yield from integer_slots(node['items'], child, defs, path + (index,))


def integer_slot_errors(node, value, defs, *, storage=False):
    """`current_integer` at each integer slot, with the slot's bounds (Storage uint64 slots also cap at 2^64-1)."""
    errors = []
    for _path, number, minimum, maximum in integer_slots(node, value, defs):
        if storage:
            minimum = 0 if minimum is None else max(minimum, 0)
            maximum = UINT64_MAX if maximum is None else min(maximum, UINT64_MAX)
        try:
            current_integer(number, minimum=minimum, maximum=maximum)
        except Refusal as refusal:
            errors.append(refusal.reason)
    return errors


def payload_number_errors(definition, payload):
    """A current logical payload: its definition's integer slots, then the producer JCS qualification of the payload."""
    node = payload_definitions().get(definition) if type(definition) is str else None
    errors = integer_slot_errors(node, payload, payload_definitions()) if node is not None else []
    return errors or jcs_errors(payload)


def envelope_number_errors(event):
    """A current EventRecord envelope: its integer slots other than Storage's sequence_id (SP-026/SP-236 uint64, read
    by `storage_sequence_valid`), then the CV-317 producer projection's qualification (the fields it holds)."""
    if type(event) is not dict:
        return []
    document = envelope_document()
    properties = {k: v for k, v in document['properties'].items() if k != 'sequence_id'}
    errors = integer_slot_errors({'properties': properties}, event, document['$defs'])
    return errors or jcs_errors({k: event[k] for k in SEMANTIC_FIELDS if k in event})


def jcs_errors(value):
    """CV-1100: the shared qualified RFC 8785 serialization refuses a number it cannot encode exactly."""
    try:
        qualified_jcs(value)
    except Refusal as refusal:
        return [refusal.reason]
    return []


def identity_number_errors(identity, family, payload):
    """The identity preimage is actual JCS (`qualified_jcs` in the owner's identity recipe): its refusal is a number
    refusal before any effect, never an exception."""
    try:
        identity(family, payload)
    except Refusal as refusal:
        return [refusal.reason]
    except (KeyError, TypeError, AttributeError):
        return []
    return []


def storage_sequence_valid(event):
    try:
        storage_uint64(event.get('sequence_id'))
    except Refusal:
        return False
    return True


def number_rule_for_record(case=None, *, retained=False):
    """Select the write-time rule; a caller's recipe label alone grants nothing.

    Current inputs use the current gates (CV-1100 slots and qualification). A retained original's recipe is its
    sealed custody's, resolved through the SP-1101 `RetainedDispatcher` (sweep part 2B, `recipe_view`); both supported
    original editions keep their originally valid number types. The RECIPE rows refuse a custody refusal and join
    the disclosed label and evidence against custody, never against live state.
    """
    if not retained:
        return CURRENT_NUMBER_RULE, []
    view = recipe_view(case)
    return view['recipe'], run_rows(guards.RECIPE_ROWS, view)


def record_number_errors(value, case=None, *, retained=False):
    """A current EventRecord's number errors (sweep part 2B: slot-directed, see `envelope_number_errors`); a retained
    original takes its own write-time recipe instead (SP-1101, `number_rule_for_record`)."""
    rule, errors = number_rule_for_record(case, retained=retained)
    if errors or rule != CURRENT_NUMBER_RULE:
        return errors
    definition = value.get('event_type', '').replace('.', '_') if type(value) is dict and type(value.get('event_type')) is str else None
    payload = value.get('payload') if type(value) is dict else None
    return list(dict.fromkeys(envelope_number_errors(value) or (
        payload_number_errors(definition, payload) if type(payload) is dict and payload else [])))


def number_token_errors(token):
    """A raw current number token, through the shared parser: `loads_current_json` refuses `-0`, `01`, non-finite
    and malformed tokens (and an integer token becomes an exact int, any length). A fraction or exponent token
    (`1.0`, `1e0`) is a valid JSON number; whether it may stand at a slot is that slot's question
    (`current_integer` at integer slots)."""
    try:
        loads_current_json(token)
    except Refusal as refusal:
        return ['number_token:' + refusal.reason]
    return []


def canonical_loads(text):
    """A current raw JSON document, parsed by the shared `loads_current_json` (sweep part 2B)."""
    try:
        return loads_current_json(text)
    except Refusal as refusal:
        raise ValueError('number_token:' + refusal.reason) from refusal


def exact_number(token):
    """A number token as the lane holds it: an integer token as an exact int of any length (never Python's
    4300-digit `int()` limit), a fraction or exponent token as the float json.loads gives."""
    if not any(c in token for c in '.eE'):
        return JsonNumber(token, True).exact()
    return json.loads(token)


def fixture_loads(text):
    """Decode original domains intact; check raw tokens only at current inputs.

    Retained events, Storage receipts and typed sources are observations, not
    current writer input. No recursive key-name or numeric-rewriting exemption.
    Sweep part 2B: current tokens go through the shared parser (`number_token_errors`); every integer token becomes
    an exact int of any length; a duplicate key anywhere refuses, as `loads_current_json` refuses one.
    """
    class Number:
        def __init__(self, token):
            self.token = token

    def unique(pairs):
        result = {}
        for key, value in pairs:
            if key in result:
                raise ValueError('duplicate_key:' + key)
            result[key] = value
        return result
    current = {
        'valid_payloads': {'payload'}, 'event_cases': {'event', 'logical_payload', 'producer_context'},
        'body_cases': {'payload'}, 'board_storage_cases': {'payload', 'envelope'},
        'retry_cases': {'candidate'}, 'retry_transition_cases': {'context'},
    }
    raw = json.loads(text, parse_int=Number, parse_float=Number, parse_constant=Number, object_pairs_hook=unique)

    def scalar(text, path):
        # The shared parser's `unicode_scalar` refusal (a lone surrogate) at a current input, for strings and keys.
        if len(path) >= 3 and path[0] in current and path[2] in current[path[0]]:
            try:
                text.encode('utf-8')
            except UnicodeError:
                raise ValueError('number_token:unicode_scalar') from None
        return text

    def decode(value, path=()):
        if isinstance(value, str):
            return scalar(value, path)
        if isinstance(value, Number):
            is_current = (len(path) >= 3 and path[0] in current and path[2] in current[path[0]])
            storage_sequence = (len(path) == 4 and path[3] == 'sequence_id'
                and (path[0], path[2]) in (('event_cases', 'event'), ('retry_cases', 'candidate')))
            if storage_sequence:
                # Field-owner dispatch; never round-trip Storage uint64 through JCS.
                storage_uint64(JsonNumber(value.token, not any(c in value.token for c in '.eE')))
            elif is_current and number_token_errors(value.token):
                raise ValueError(number_token_errors(value.token)[0] + ':' + value.token)
            return exact_number(value.token)
        if isinstance(value, dict):
            return {scalar(key, path + (key,)): decode(child, path + (key,)) for key, child in value.items()}
        if isinstance(value, list):
            return [decode(child, path + (index,)) for index, child in enumerate(value)]
        return value
    return decode(raw)


def integer_value(value):
    """JSON integer semantics, preserving originally valid integral floats."""
    return type(value) in (int, float) and (type(value) is int or value.is_integer())


def retry_context_errors(context):
    """OSI-699 transition context types, through the RETRY_CONTEXT table (sweep part 2A)."""
    return run_rows(guards.RETRY_CONTEXT_ROWS, {'context': context})


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
    """SP-236 / SP-1100 (sweep part 2B): the EventRecord value bytes, the shared `storage_value_bytes` with the
    EVENT_VALUE profile (canonical MessagePack: UTF-8 key order, minimal integers, a float as float32 when that is
    exact and float64 otherwise). It replaces the lane's msgpack call, which wrote every float as float64. Used for
    event values, their inline payloads and SP-337 `application/msgpack` payload bytes. An unencodable value refuses
    (`Refusal`, a ValueError)."""
    return storage_value_bytes(value, profile=EVENT_VALUE)


def app_packed(value):
    """CV-366 / SP-1100: an application physical wrapper's bytes (`pm.application.physical_messagepack.v1`, the shared
    APP_PHYSICAL profile: every float as float64)."""
    return storage_value_bytes(value, profile=APP_PHYSICAL)


def semantic_digest(event):
    """CV-317 producer semantic digest through the shared `producer_semantic_digest` (CV-1100 qualified RFC 8785).

    A missing field is a KeyError, as before. A projection the shared serializer cannot encode exactly has no digest
    (None): every reader compares it with a recorded or recomputed string, so it refuses there, never as an exception.
    """
    projection = {k: event[k] for k in SEMANTIC_FIELDS}
    try:
        return producer_semantic_digest(projection)
    except Refusal:
        return None


def partition(payload):
    return ('app' if payload['scope'] == 'application' else 'project~' +
            base64.urlsafe_b64encode(payload['project_id'].encode()).decode().rstrip('='))


def pack_entry(value, media_type='application/msgpack'):
    data = packed(value) if media_type == 'application/msgpack' else value.encode('utf-8')
    return {'blake3_id': 'blake3:' + blake3.blake3(data).hexdigest(),
            'byte_size': len(data), 'media_type': media_type, 'value': value,
            'bytes_durable': True, 'index_durable': True}


def pack_type_errors(entry):
    return run_rows(guards.PACK_TYPE_ROWS, {'entry': entry})


def pack_errors(entry, *, large=False):
    """SP-337 pack entry, through the PACK tables (sweep part 2A); the original's stops after shape, types,
    identifier and encoding are kept."""
    view = {'entry': entry, 'large': large}
    for table in (guards.PACK_SHAPE_ROWS, guards.PACK_TYPE_ROWS, guards.PACK_IDENTIFIER_ROWS):
        errors = run_rows(table, view)
        if errors:
            return errors
    view.update(pack_view(entry))
    errors = run_rows(guards.PACK_ENCODING_ROWS, view)
    if errors:
        return errors
    return run_rows(guards.PACK_INTEGRITY_ROWS, view)


def transport_type_errors(event, logical, packs):
    return run_rows(guards.TRANSPORT_TYPE_ROWS, {'event': event, 'logical': logical, 'packs': packs})


def transport_errors(event, logical, packs, *, ingest_encoding='decoded'):
    """Inline/external transport, through the TRANSPORT and PACK tables (sweep part 2A).

    Sweep part 2A: a missing pack entry is refused once, by the join that looked it up (`external_payload_join` or
    `content_reference_join`); the PACK rows run on an entry that exists. Before, a missing entry also gave
    `payload_pack_shape`, the same defect a second time.
    """
    view = {'event': event, 'logical': logical, 'packs': packs, 'ingest_encoding': ingest_encoding}
    type_errors = run_rows(guards.TRANSPORT_TYPE_ROWS, view)
    if type_errors:
        return type_errors
    errors = []
    try:
        view['inline_packed_size'] = len(packed(event['payload']))
        errors += run_rows(rows_named(guards.TRANSPORT_INLINE_ROWS, ('inline_payload_size',)), view)
        ref = event['payload_ref']
        errors += run_rows(rows_named(guards.TRANSPORT_INLINE_ROWS, ('inline_payload_join',)), view)
        if ref is not None:
            entry = packs.get(ref)
            view['payload_entry'] = entry
            if entry:
                errors += pack_errors(entry, large=True)
            errors += run_rows(guards.TRANSPORT_EXTERNAL_ROWS, view)
        if 'content_ref' in logical:
            entry = packs.get(logical['content_ref']['blake3_id'])
            view['content_entry'] = entry
            if entry:
                errors += pack_errors(entry, large=True)
            errors += run_rows(guards.TRANSPORT_CONTENT_ROWS, view)
        # An actual ingest adapter identifies encoded input. Literal text may
        # contain a data URI; its characters cannot prove an ingest encoding.
        errors += run_rows(guards.TRANSPORT_INGEST_ROWS, view)
    except (TypeError, ValueError, UnicodeError, KeyError):
        errors += run_rows(guards.TRANSPORT_ENCODING_ROWS, {'transport_encoding_failed': True})
    return errors


def phase_context_errors(context):
    return run_rows(guards.APPEND_PHASE_CONTEXT_ROWS, {'family': 'phase.force_completed', 'producer_context': context})


def predicate_errors(family, payload, context, retry_allowed):
    """The family producer predicates, through the APPEND_PHASE_CONTEXT, APPEND_PREDICATE, APPEND_RETRY_SOURCE and
    APPEND_RETRY_TRANSITION tables (sweep part 2A), with the original's stops."""
    # Reached only with a payload the closed schema accepts (event_errors stops before otherwise).
    view = {'family': family, 'payload': payload, 'producer_context': context, 'payload_schema_valid': True}
    for table in (guards.APPEND_PHASE_CONTEXT_ROWS, guards.APPEND_PREDICATE_ROWS, guards.APPEND_RETRY_SOURCE_ROWS):
        errors = run_rows(table, view)
        if errors:
            return errors
    view['retry_transition_allowed'] = bool(retry_allowed(context)) if family == 'subagent.retried' else None
    return run_rows(guards.APPEND_RETRY_TRANSITION_ROWS, view)


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
    result['event'] = StorageRecordValidator(result['event'])
    checkpoint_defs = documents['event_record_index_checkpoint']['$defs']
    for key in ('checkpoint', 'read_token'):
        result[key] = StorageIntegerValidator(result[key], checkpoint_defs[key], checkpoint_defs)
    return result


def member_payload_schema_id(definition, version):
    """The envelope's payload_schema_id, from the selected definition.

    SP-320 board members carry no stored schema_id, so this never reads one from
    the payload; for the other families their schema's const pins the same name.
    """
    return f'pm.event_payload.{definition}.v1@{version}'


def event_errors(case, schema, identity, retry_allowed, root, formats, *, historical=False):
    """The append (or, historical, the original-event) check, through the APPEND tables (sweep part 2A)."""
    event, payload = case['event'], case['logical_payload']
    if historical:
        numeric_errors = number_rule_for_record(case, retained=True)[1]
    else:
        numeric_errors = run_rows(guards.APPEND_NUMBER_ROWS, append_number_view(case, identity))
    if numeric_errors:
        return numeric_errors
    view = append_reference_view(case, schema, root)
    refs = run_rows(guards.APPEND_REFERENCE_ROWS, view)
    if refs:
        return refs
    view.update(append_shape_view(case, schema, root, formats, historical))
    errors = run_rows(rows_named(guards.APPEND_SHAPE_ROWS, APPEND_ENVELOPE_ROWS), view)
    payload_errors = run_rows(rows_named(guards.APPEND_SHAPE_ROWS, ('logical_payload_schema',)), view)
    if payload_errors:
        return errors + payload_errors
    view.update(append_join_view(case, identity))
    errors += run_rows(guards.APPEND_JOIN_ROWS, view)
    errors += predicate_errors(case['event_type'], payload, case['producer_context'], retry_allowed)
    errors += transport_errors(event, payload, case['payload_packs'],
                               ingest_encoding=case.get('ingest_encoding', 'decoded'))
    return errors


def application_shape_errors(case, root, formats):
    """Closed original input/source/wrapper preconditions, before relational joins (BOARD_APPLICATION_SHAPE_ROWS)."""
    return run_rows(guards.BOARD_APPLICATION_SHAPE_ROWS, application_shape_view(case, root, formats))


def board_source_errors(case, root, formats):
    """Validate the selected closed original, not a hand-written source summary (the BOARD tables, sweep part 2A)."""
    payload = case['payload']
    if payload['scope'] != 'application':
        # Project source is the unchanged original codec behind an explicit
        # synthetic adapter; the canonical board message itself is joined below.
        shape_errors = project_original_input_errors(case, formats)
        if shape_errors:
            return shape_errors
        view = board_project_view(case)
        errors = run_rows(guards.BOARD_PROJECT_SOURCE_ROWS, view)
    else:
        errors = application_shape_errors(case, root, formats)
        if errors:
            return errors
        view = board_application_view(case)
        errors = run_rows(guards.BOARD_APPLICATION_SOURCE_ROWS, view)
    return errors + run_rows(guards.BOARD_POSTED_ROWS, view)


def project_original_input_errors(case, formats):
    """Validate the unchanged Project adapter before reading any joined value (the PROJECT_INPUT tables).

    OSI-247/299/301 supply the types/enums. This adapter's context names are
    files/operations/sender_node/related_message_ids; no original is rewritten.
    JSON integer semantics on reference sizes retain valid original floats.
    """
    source = case['source']
    view = {'source': source, 'message': source.get('original_input') if type(source) is dict else None}
    # Each later stage's rows read the earlier stage's verdict and abstain when it refused, as this checker stops there.
    for table, verdict in ((guards.PROJECT_INPUT_SHAPE_ROWS, 'project_shape_valid'), (guards.PROJECT_INPUT_TYPE_ROWS, 'project_types_valid')):
        errors = run_rows(table, view)
        if errors:
            return errors
        view[verdict] = True
    message = view['message']
    view['created_at_conforms'] = formats.conforms(message['created_at'], 'date-time')
    view['content_inline_body'] = inline_body(message['content']) if message['content'] is not None else None
    return run_rows(guards.PROJECT_INPUT_VALUE_ROWS, view)


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
    """Refuse a change to a selected shared definition, whatever the whole-file pin says (SELECTED_DEFINITION_ROWS)."""
    return run_rows(guards.SELECTED_DEFINITION_ROWS, selected_definition_view(documents))


def successor_errors(root):
    """Pin the whole live successor selection without rewriting frozen graphs (the SUCCESSOR tables, sweep part 2A)."""
    return successor_errors_from(successor_inputs(root))


@lru_cache(maxsize=1)
def retry_schemas():
    plans = Path(__file__).resolve().parents[1] / 'Plans'
    event = StorageRecordValidator(StrictValidator(json.loads((plans / 'event_record.schema.json').read_text()),
                                                   format_checker=UTC_FORMAT))
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
    """Retry of an original append, through the RETRY tables (sweep part 2A): the first stage that refuses gives the
    status; otherwise the original receipt, unchanged."""
    view = retry_view(original, candidate)
    for table in (guards.RETRY_NUMBER_ROWS, guards.RETRY_SHAPE_ROWS, guards.RETRY_REPLAY_ROWS, guards.RETRY_IDENTITY_ROWS):
        errors = run_rows(table, view)
        if errors:
            return {'status': errors[0], 'appended': False, 'receipt': None}
    view.update(original_semantic_digest=semantic_digest(original), candidate_semantic_digest=semantic_digest(candidate))
    errors = run_rows(guards.RETRY_SEMANTIC_ROWS, view)
    if errors:
        return {'status': errors[0], 'appended': False, 'receipt': None}
    return {'status': 'original_result', 'appended': False, 'receipt': copy.deepcopy(original)}


def historical_read_errors(case, schema, owner_module):
    """The retained-history read, through the HISTORICAL tables plus the checkpoint and original-event tables (sweep
    part 2A). Only captured original facts enter original-event validation: current live child/phase/model/board/
    Stop/deadline/permission state cannot recapture them."""
    root, formats = owner_module.ROOT, owner_module.UTC_FORMAT
    state = case.get('historical_reader_state')
    view = {'historical_state_valid': selected_validators(root, formats)['historical'].is_valid(state)}
    errors = run_rows(guards.HISTORICAL_STATE_ROWS, view)
    if errors:
        return errors
    recipe, recipe_errors = number_rule_for_record(case, retained=True)
    if recipe_errors:
        return recipe_errors
    errors = checkpoint_errors(case, root, formats)
    view.update(historical_view(case))
    errors += run_rows(guards.HISTORICAL_READER_ROWS, view)
    original = copy.deepcopy(case)
    original['producer_context'] = state['original_producer_context']
    selected_identity = lambda family, payload: owner_module.historical_identity(family, payload, recipe)
    errors += event_errors(original, schema, selected_identity, owner_module.retry_allowed,
                           root, formats, historical=True)
    errors += run_rows(guards.HISTORICAL_DISCLOSURE_ROWS, view)
    return errors


def recover_original(case, schema, owner_module, candidate=None):
    """Resolve verified original bytes before a retry; never remint an old ID."""
    if historical_read_errors(case, schema, owner_module):
        return {'status': 'historical_original_unverified', 'appended': False, 'receipt': None}
    if candidate is not None:
        return retry_outcome(case['event'], candidate)
    return {'status': 'original_result', 'appended': False, 'receipt': copy.deepcopy(case['event'])}


# ---- Guard tables (sweep part 2A) ------------------------------------------------------------------------------
# Every DO refusal is a named predicate in `pm_orchestrator_event_guards`; the checkers below reach a refusal only
# through `run_rows`. A view is the flat dict of the case's own fields and the values recomputed from them that the
# rows read; each row sees only the keys it declares, so an undeclared read fails here as a KeyError.

def run_rows(rows, view, context=None):
    """Evaluate every row in order and return the refusal codes, a compound group's code once."""
    errors, groups = [], set()
    for name, _subject, _words, code, predicate, reads, group in rows:
        result = predicate({key: view[key] for key in reads}, context)
        if result is None:
            continue
        if type(result) is not str or result != code:
            raise AssertionError(('guard_protocol', name, result))
        if group is not None:
            if group in groups:
                continue
            groups.add(group)
        errors.append(code)
    return errors


def refusing_rows(rows, view, context=None):
    """The matrix row of one input: the name of every row that refuses it, with no early stop and no grouping."""
    return [row[0] for row in rows if all(key in view for key in row[5])
            and row[4]({key: view[key] for key in row[5]}, context) is not None]


def rows_named(rows, names):
    selected = tuple(row for row in rows if row[0] in names)
    assert tuple(row[0] for row in selected) == tuple(names), ('rows_named', names)
    return selected


ROW_EVENT_COPY_ROWS = ('index_row_scope_kind', 'index_row_project_id', 'index_row_scope_partition', 'index_row_sequence_id',
                       'index_row_event_id', 'index_row_event_type', 'index_row_producer_semantic_digest',
                       'index_row_idempotency_key', 'index_row_payload_sha256', 'index_row_correlation_id',
                       'index_row_causation_event_id', 'index_row_persisted_at_utc', 'index_row_redaction_profile',
                       'index_row_source_schema_id', 'index_row_source_schema_version', 'index_row_projector_replay_only')
COVERAGE_COPY_ROWS = (
    'coverage_segment_count', 'coverage_segment_generation', 'coverage_segment_name', 'coverage_frame_byte_offset',
    'coverage_frame_end_offset', 'coverage_scanned_through_offset', 'coverage_source_durable_end_offset',
    'coverage_source_durable_bytes_sha256')
SEQUENCE_COPY_ROWS = (
    'coverage_first_retained_sequence_id', 'coverage_through_sequence_id', 'coverage_retained_event_count',
    'coverage_frame_last_sequence_id', 'coverage_segment_first_sequence_id', 'coverage_segment_last_sequence_id',
    'coverage_segment_retained_event_count', 'segment_name_first_sequence', 'segment_name_last_sequence',
    'anchor_first_retained_sequence_id', 'anchor_through_sequence_id', 'anchor_retained_event_count')
SEGMENT_IDENTITY_ROWS = ('segment_name_generation', 'segment_name_state')
SELECTION_COPY_ROWS = (
    'anchor_selected_segment_generation', 'frontier_selected_segment_generation', 'frontier_current_bytes_sha256',
    'frontier_recovery_epoch', 'frontier_excluded_ranges_sha256', 'frontier_retired_inputs_sha256',
    'anchor_sequence_gaps_sha256')
SEQUENCE_GAP_ROWS = ('sequence_gap_retained', 'sequence_gap_order')
ROW_LOCATOR_ROWS = ('row_source_segment_generation', 'row_source_segment_name', 'row_source_byte_offset',
                    'row_source_sequence_id', 'row_translation_ref')
GENERATION_COPY_ROWS = ('generation_id_copy', 'generation_dataset_name', 'generation_id_recipe',
                        'generation_translation_origin', 'translation_target_selection')
CHECKPOINT_STAGES = ('CHECKPOINT_SCHEMA_ROWS', 'CHECKPOINT_IDENTITY_ROWS', 'CHECKPOINT_CURRENT_ROWS',
                     'CHECKPOINT_JOIN_ROWS', 'CHECKPOINT_FRAME_ROWS', 'CHECKPOINT_COVERAGE_ROWS')


def typed_text(value):
    """The exact-type tree of a value (`typed_tree`) as one canonical JSON string: two values are typed-equal exactly
    when their strings are equal. A view carries the string, not the tree, because the guard tool snapshots every node
    of the value at each predicate instruction."""
    return json.dumps(typed_tree(value), ensure_ascii=False, separators=(',', ':'))


# ---- SP-1101 retained-original dispatch (sweep part 2B, DO-C8-N4) ----------------------------------------------
# A retained original's identity recipe is selected by its sealed custody, never by the case: the reader asks the
# composition-installed `RetainedDispatcher` for the original at its seglog ref. The owner (`DOOriginalOwner`) returns
# custody only for bytes Storage sealed at that ref, with the recipe tuple recorded when they were written; the frozen
# verifier for that tuple recomputes the event's identity, payload join and source commitment from the bytes. The
# case's own label (`original_identity_recipe`) and evidence are disclosed copies, joined against custody by the
# RECIPE rows; a label or a `verified` flag grants nothing. Current disclosure stays with the disclosure rows.
#
# The static stand-in for Storage's sealed custody is `ORIGINAL_CUSTODY`: `install_original_custody` seals the
# committed positive originals at composition (event, retained and compatibility cases) and the lane's writer
# builders seal what they write (`seal_original`). The case under check never adds to it. Native custody NOT_RUN.
ORIGINAL_CUSTODY = {}
RECIPE_PRODUCER = 'cv317-producer-semantic-qualified-rfc8785-v1'
RECIPE_FULL_VALUE = 'pm.storage.original_event_value_commitment.v1'
RECIPE_LOCAL_SOURCE = 'do-original-source-sha256-of-event-value-bytes-v1'
RECIPE_PAYLOAD = 'sp337-application-msgpack-event-value-v1'
ENVELOPE_EDITIONS = (('pm.event.v0', '2.0.0'), ('pm.event.v0', '1.0.0'))


@lru_cache(maxsize=1)
def recipe_resource_manifest():
    """SHA-256 of the frozen resources a DO recipe tuple names: the EventRecord and DO payload schema documents."""
    digests = [hashlib.sha256((PLANS / name).read_bytes()).hexdigest()
               for name in ('event_record.schema.json', 'orchestrator_event_payloads.schema.json')]
    return hashlib.sha256(json.dumps(digests, separators=(',', ':')).encode('ascii')).hexdigest()


def recipe_tuple(event, identity_recipe):
    """The write-time recipe tuple of a DO original (the event's own editions and the identity recipe)."""
    payload_schema_id, _, payload_schema_version = str(event.get('payload_schema_id')).partition('@')
    return RecipeTuple(
        envelope_schema_id=str(event.get('schema_id')), envelope_schema_version=str(event.get('schema_version')),
        payload_schema_id=payload_schema_id or 'missing', payload_schema_version=payload_schema_version or 'missing',
        owner_source_id='Plans/orchestrator-subagent-integration.md#' + str(event.get('event_type')),
        owner_edition='1.0.0', registry_revision='prepared_without_admission', identity_recipe=identity_recipe,
        producer_recipe=RECIPE_PRODUCER, physical_profile=EVENT_VALUE, full_value_profile=RECIPE_FULL_VALUE,
        local_source_profile=RECIPE_LOCAL_SOURCE, payload_profile=RECIPE_PAYLOAD,
        resource_manifest_sha256=recipe_resource_manifest())


def original_binding(case):
    """The binding the reader expects, from the case it was asked about."""
    event, payload = case['event'], case['logical_payload']
    return OriginalBinding(
        storage_instance_id=payload['storage_instance_id'], scope_kind=event['scope_kind'], server_id=payload['server_id'],
        project_id=event['project_id'], event_type=event['event_type'], event_id=event['event_id'],
        idempotency_key=event['idempotency_key'], owner_operation_id=payload['operation_id'],
        source_commitment=hashlib.sha256(packed(event)).hexdigest())


class DOOriginalOwner:
    """Storage's custody at one seglog ref (static stand-in): it authenticates the bytes the reader fetched there
    against what was sealed at write time, and returns them with the sealed recipe tuple."""

    def __init__(self, record_bytes, result_bytes):
        self.record_bytes, self.result_bytes = record_bytes, result_bytes

    def authenticated_original(self, original_ref):
        sealed = ORIGINAL_CUSTODY.get(original_ref)
        if not sealed:
            raise Refusal('original_query')
        entry = sealed.get(hashlib.sha256(self.record_bytes).hexdigest())
        if entry is None:
            raise Refusal('original_authority')
        return OriginalCustody(entry['binding'], entry['recipe'], self.record_bytes, self.result_bytes, self.record_bytes)


def frozen_verifier(identity_recipe, historical_identity):
    """The frozen verifier of one DO identity recipe: recompute the original's identity, payload join and source
    commitment from its sealed bytes (no current writer gate, no live state)."""
    def verify(custody):
        event = decode_storage_value(custody.record_bytes, profile=EVENT_VALUE)
        payload = decode_storage_value(custody.result_bytes, profile=EVENT_VALUE)
        binding = custody.binding
        if type(event) is not dict or type(payload) is not dict:
            return False
        if event.get('payload') != payload and not (event.get('payload_ref') is not None and event.get('payload') == {}):
            return False
        try:
            key, event_id = historical_identity(event['event_type'], payload, identity_recipe)
        except (Refusal, ValueError, KeyError, TypeError):
            return False
        return (key == event['idempotency_key'] == binding.idempotency_key and event_id == event['event_id'] == binding.event_id
                and hashlib.sha256(custody.record_bytes).hexdigest() == binding.source_commitment
                and custody.recipe == recipe_tuple(event, identity_recipe))
    return FrozenRecipe(verify)


RECIPE_VERIFIERS = {}


def install_recipe_verifiers(owner_module):
    """Composition: the frozen recipe map, one FrozenRecipe per (family, envelope edition, identity recipe)."""
    if RECIPE_VERIFIERS:
        return
    for event_type, definition in family_definitions().items():
        for schema_id, schema_version in ENVELOPE_EDITIONS:
            probe = {'schema_id': schema_id, 'schema_version': schema_version, 'event_type': event_type,
                     'payload_schema_id': member_payload_schema_id(definition, '1.0.0')}
            for identity_recipe in (LEGACY_RECIPE, CURRENT_RECIPE):
                RECIPE_VERIFIERS[recipe_tuple(probe, identity_recipe)] = frozen_verifier(
                    identity_recipe, owner_module.historical_identity)


@lru_cache(maxsize=1)
def family_definitions():
    """event_type -> payload definition, from the committed contracts list of the fixture file."""
    contracts = json.loads((PLANS / 'orchestrator_event_contract_fixtures.json').read_text())['contracts']
    return {c['event_type']: c['definition'] for c in contracts}


def seal_original(case, identity_recipe=None):
    """The writer's side (static stand-in): Storage seals an original's bytes at its seglog ref with its write-time
    recipe. Only the lane's own writer builders and composition call this, never a reader."""
    event = case['event']
    recipe = identity_recipe or case['historical_reader_state']['original_identity_recipe']
    binding = original_binding(case)
    ORIGINAL_CUSTODY.setdefault('seglog:' + event['event_id'], {})[binding.source_commitment] = {
        'binding': binding, 'recipe': recipe_tuple(event, recipe)}
    return case


def sealed_original_entry(case, identity_recipe):
    """The custody record the writer keeps for one original (the `sealed_originals` fixture rows): its seglog ref,
    binding, recipe editions and write-time recipe. Written by the writer, read only at composition."""
    event, binding = case['event'], original_binding(case)
    return {'original_ref': 'seglog:' + event['event_id'], 'identity_recipe': identity_recipe,
            'binding': {name: getattr(binding, name) for name in OriginalBinding.__dataclass_fields__},
            'editions': {key: event[key] for key in ('schema_id', 'schema_version', 'event_type', 'payload_schema_id')}}


def install_original_custody(fixtures, owner_module):
    """Composition: seal the committed positive originals, and the writer-built originals that appear only inside
    negative cases (`sealed_originals`), and install the frozen recipe map."""
    install_recipe_verifiers(owner_module)
    for key in ('event_cases', 'retained_event_cases', 'compatibility_event_cases'):
        for case in fixtures[key]:
            seal_original(case)
    for entry in fixtures.get('sealed_originals', ()):
        binding = OriginalBinding(**entry['binding'])
        ORIGINAL_CUSTODY.setdefault(entry['original_ref'], {})[binding.source_commitment] = {
            'binding': binding, 'recipe': recipe_tuple(entry['editions'], entry['identity_recipe'])}


def resolve_original(case):
    """The SP-1101 resolution: (custody, None) or (None, refusal reason). Never raises."""
    try:
        event = case['event']
        record_bytes, result_bytes = packed(event), packed(case['logical_payload'])
        dispatcher = RetainedDispatcher(DOOriginalOwner(record_bytes, result_bytes), RECIPE_VERIFIERS)
        custody = dispatcher.resolve(case['historical_reader_state']['original_source_ref'], original_binding(case),
                                     disclose=lambda binding: True)
        return custody, None
    except Refusal as refusal:
        return None, refusal.reason
    except (KeyError, TypeError, AttributeError, ValueError):
        return None, 'original_query'


def recipe_view(case):
    state = case['historical_reader_state']
    custody, refusal = resolve_original(case)
    recipe = custody.recipe.identity_recipe if custody is not None else None
    expected = recipe_witness_value(case, recipe) if custody is not None else None
    return {'custody_refusal': refusal, 'recipe': recipe, 'disclosed_recipe': state['original_identity_recipe'],
            'recipe_evidence': state['original_recipe_evidence'], 'recipe_expected_value': expected,
            'recipe_expected_source_ref': 'writer-recipe:' + case['event']['event_id'],
            'recipe_expected_source_sha256': hashlib.sha256(packed(expected)).hexdigest() if expected is not None else None}


def checkpoint_schema_view(case, root, formats):
    v = selected_validators(root, formats)
    read = case['read']
    return {'checkpoint_schema_valid': not list(v['checkpoint'].iter_errors(read['checkpoint'])),
            'read_token_schema_valid': not list(v['read_token'].iter_errors(read['read_token']))}


def checkpoint_identity_view(case):
    read = case['read']
    return {'storage_instance_id': case['logical_payload']['storage_instance_id'],
            'checkpoint_storage_instance_id': read['checkpoint']['storage_instance_id'], 'read_token': read['read_token']}


def checkpoint_current_view(case):
    cp = case['read']['checkpoint']
    return {'current_generation_id': cp['current_generation_id'],
            'generation_states': {key: node['state'] for key, node in cp['generations'].items()}}


def binding_or_none(value):
    """An SP-278 binding digest, or None when the value holds what the uint-only codec cannot encode (an integral float
    copy, DO-P1F4-S1): the copy's own row and its record's schema verdict refuse it, and no view raises."""
    try:
        return binding_digest(value)
    except (TypeError, ValueError, OverflowError):
        return None


def checkpoint_join_view(case, root, formats):
    read, event = case['read'], case['event']
    cp, token, row = read['checkpoint'], read['read_token'], read['row']
    storage_id = case['logical_payload']['storage_instance_id']
    generation_id = cp['current_generation_id']
    node = cp['generations'][generation_id]
    frontier = node['frontier']
    key = 'event_record_index_checkpoint.v1:' + storage_id
    expected = {'storage_instance_id': storage_id, 'checkpoint_key': key,
        'checkpoint_ref': key + '#/generations/' + generation_id, 'generation_id': generation_id,
        'generation_anchor_sha256': binding_or_none(node['anchor']),
        'frontier_revision': frontier['publication_revision'], 'frontier_sha256': binding_or_none(frontier),
        'index_dataset_name': 'event_record_index.v2@' + generation_id,
        'source_selection': frontier['source_selection'], 'redb_snapshot_id': read['snapshot_id']}
    typed_token_selection = typed_text(token['source_selection'])
    typed_frontier_selection = typed_text(frontier['source_selection'])
    typed_current_selection = typed_text(read['current_source_selection'])
    expected_row = expected_row_copies(case)
    row_key = f"event_record_index.v2:{case['scope_partition']}:{event['sequence_id']:020}:{event['event_id']}"
    source_value_sha256 = hashlib.sha256(packed(event)).hexdigest()
    row_schema_valid = not list(index_row_validator(root, formats).iter_errors(row))
    expected_set = binding_or_none({'domain': 'pm.event_index.row_set.v1', 'entries': [{'key': read['row_key'], 'value': row}]})
    # The prefix is recomputed from the event's own bytes, not from the read's copy of their hash.
    expected_prefix = binding_or_none({'domain': 'pm.event_index.retained_prefix.v1', 'entries': [{
        'sequence_id': event['sequence_id'], 'event_id': event['event_id'],
        'scope_partition': case['scope_partition'], 'source_value_sha256': source_value_sha256}]})
    return {'expected_read_token': expected, 'typed_read_token_source_selection': typed_token_selection,
            'typed_frontier_source_selection': typed_frontier_selection,
            'typed_current_source_selection': typed_current_selection,
            'anchor_source_selection': node['anchor']['source_selection'],
            'frontier_source_selection': frontier['source_selection'], 'row': row, 'expected_row': expected_row,
            'row_key': read['row_key'], 'expected_row_key': row_key, 'typed_source_event': typed_text(read['source_event']),
            'typed_event': typed_text(event), 'source_value_sha256': read['source_value_sha256'],
            'expected_source_value_sha256': source_value_sha256, 'index_row_schema_valid': row_schema_valid,
            'frontier_index_row_count': frontier['index_row_count'],
            'frontier_index_row_set_sha256': frontier['index_row_set_sha256'], 'expected_row_set_sha256': expected_set,
            'anchor': node['anchor'], 'coverage': frontier['coverage'], 'expected_prefix_sha256': expected_prefix}


def frame_name_view(coverage, event):
    """The last frame's segment-name fields, parsed by the grammar outside the predicates (a predicate calls no
    helper): the three groups, or None when the name is not a string the grammar matches; the frame's generation in
    at least six digits; and, with an event, its sequence in 20 digits."""
    frame = coverage['last_frame']
    name = frame['segment_name'] if type(frame) is dict else None
    match = SEGMENT_NAME.fullmatch(name) if type(name) is str else None
    generation = frame['segment_generation'] if type(frame) is dict else None
    view = {'coverage': coverage, 'frame_segment_name_groups': list(match.groups()) if match else None,
            'frame_generation_digits': f'{generation:06}' if type(generation) is int and generation >= 0 else None}
    if event is not None:
        sequence = event['sequence_id']
        view.update(event_sequence_id=sequence, event_sequence_digits=f'{sequence:020}' if type(sequence) is int else None)
    return view


def generation_view(storage_instance_id, generations):
    return {'generation_copies': {key: {'generation_id': node['generation_id'], 'index_dataset_name': node['index_dataset_name'],
                                        'origin': node['origin'], 'translation': node['translation']}
                                  for key, node in generations.items()},
            'generation_recipe_ids': {key: generation_identity(storage_instance_id, node) for key, node in generations.items()},
            'generation_birth_selection_sha256': {key: binding_or_none(node['anchor']['source_selection'])
                                                  for key, node in generations.items()}}


def checkpoint_coverage_view(case):
    event, cp = case['event'], case['read']['checkpoint']
    node = cp['generations'][cp['current_generation_id']]
    view = frame_name_view(node['frontier']['coverage'], event)
    view.update(event_id=event['event_id'], event_packed_size=len(packed(event)), empty_gaps_sha256=EMPTY_GAPS_SHA256,
                current_translation=node['translation'])
    view.update(generation_view(case['logical_payload']['storage_instance_id'], cp['generations']))
    return view


def checkpoint_full_view(case, root, formats):
    """Every checkpoint view key the case can give, stage by stage, for the guard matrix and the guard tool: a stage
    whose inputs the case does not hold (a missing current node, a null last frame) ends the view there, exactly where
    the checker stops."""
    view = recipe_view(case)
    for build in (lambda: checkpoint_schema_view(case, root, formats), lambda: checkpoint_identity_view(case),
                  lambda: checkpoint_current_view(case), lambda: checkpoint_join_view(case, root, formats),
                  lambda: checkpoint_coverage_view(case)):
        try:
            view.update(build())
        except (KeyError, TypeError, AttributeError, IndexError):
            break
    return view



APPEND_ENVELOPE_ROWS = ('event_record_schema', 'event_storage_sequence', 'replay_only_not_appendable',
                        'family_current_replay_policy')
EVENT_TYPE_PATTERN = re.compile(r'[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+')


def pack_view(entry):
    try:
        return {'expected_entry': pack_entry(entry['value'], entry['media_type']), 'pack_encoding_failed': False}
    except (TypeError, ValueError, UnicodeError):
        return {'expected_entry': None, 'pack_encoding_failed': True}


def append_number_view(case, identity=None):
    """Sweep part 2B (CV-1100): the current append's number refusals, from the shared calls at the slots their owners
    declare: the envelope's integer slots and producer-projection qualification (`envelope_number_errors`), the
    logical payload's definition slots and qualification (`payload_number_errors`) and the identity preimage's
    qualification. The producer context is the owner's transition facts, whose types the context rows refuse."""
    event = case['event']
    errors = envelope_number_errors(event) or payload_number_errors(case['definition'], case['logical_payload'])
    if not errors and identity is not None:
        errors = identity_number_errors(identity, case['event_type'], case['logical_payload'])
    return {'number_domain_errors': list(dict.fromkeys(errors))}


def append_reference_view(case, schema, root):
    return {'schema_reference_errors': reference_errors(schema, '#/$defs/' + case['definition'], selected_documents(root))}


def append_shape_view(case, schema, root, formats, historical):
    event, payload = case['event'], case['logical_payload']
    v = selected_validators(root, formats)
    event_valid = not list(v['event'].iter_errors(event))
    return {'event': event, 'historical': historical, 'event_schema_valid': event_valid,
            # The original evaluated the uint64 rule only when the record schema passed.
            'storage_sequence_valid': storage_sequence_valid(event) if event_valid else True,
            'payload_schema_valid': not list(StrictValidator(schema['$defs'][case['definition']],
                                                             format_checker=formats).iter_errors(payload))}


def append_join_view(case, identity):
    event, payload, family = case['event'], case['logical_payload'], case['event_type']
    event_type = event.get('event_type', '')
    key, event_id = identity(family, payload)
    return {'family': family,
            'event_type_pattern_valid': type(event_type) is str and EVENT_TYPE_PATTERN.fullmatch(event_type) is not None,
            'expected_event': {'idempotency_key': key, 'event_id': event_id, 'scope_kind': payload['scope'],
                               'project_id': payload.get('project_id'), 'thread_id': payload['thread_id'],
                               'run_id': payload['run_id'], 'occurred_at_utc': payload['occurred_at_utc'],
                               'payload_schema_id': member_payload_schema_id(case['definition'], payload['schema_version'])},
            'scope_partition': case['scope_partition'], 'expected_scope_partition': partition(payload)}


def append_full_view(case, schema, identity, retry_allowed, root, formats, historical=False):
    """Every append view key the case can give, for the guard matrix and the guard tool (stops where the checker
    stops: a number-domain or reference refusal, or a payload the closed schema refuses)."""
    view = {} if historical else append_number_view(case, identity)
    for build in (lambda: append_reference_view(case, schema, root),
                  lambda: append_shape_view(case, schema, root, formats, historical),
                  lambda: append_join_view(case, identity)):
        try:
            view.update(build())
        except (KeyError, TypeError, ValueError, AttributeError):
            break
    view.update(family=case['event_type'], payload=case['logical_payload'], producer_context=case['producer_context'])
    view['retry_transition_allowed'] = (bool(retry_allowed(case['producer_context']))
                                        if case['event_type'] == 'subagent.retried' else None)
    return view


def transport_full_view(event, logical, packs, ingest_encoding='decoded'):
    """Every transport view key the input gives, where the lane computes it: nothing past the type stage when the
    types are wrong (transport_errors stops there)."""
    view = {'event': event, 'logical': logical, 'packs': packs, 'ingest_encoding': ingest_encoding,
            'transport_encoding_failed': False, 'payload_entry': None, 'content_entry': None}
    if run_rows(guards.TRANSPORT_TYPE_ROWS, view):
        return view
    try:
        view['inline_packed_size'] = len(packed(event['payload']))
        ref = event['payload_ref']
        view['payload_entry'] = packs.get(ref) if ref is not None else None
        view['content_entry'] = packs.get(logical['content_ref']['blake3_id']) if 'content_ref' in logical else None
    except (TypeError, ValueError, UnicodeError, KeyError):
        view['transport_encoding_failed'] = True
    return view



def retry_view(original, candidate):
    view = {'original': original, 'candidate': candidate,
            'candidate_number_errors': record_number_errors({k: value for k, value in candidate.items() if k in SEMANTIC_FIELDS})}
    if not view['candidate_number_errors']:
        view['original_shape_valid'] = retry_shape_valid(original)
        # The original evaluated the candidate's shape only when the original's held.
        view['candidate_shape_valid'] = retry_shape_valid(candidate) if view['original_shape_valid'] else None
    return view


def retry_full_view(original, candidate):
    view = {'original': original, 'candidate': candidate,
            'candidate_number_errors': record_number_errors({k: value for k, value in candidate.items() if k in SEMANTIC_FIELDS})}
    view['original_shape_valid'] = retry_shape_valid(original)
    view['candidate_shape_valid'] = retry_shape_valid(candidate) if view['original_shape_valid'] else None
    try:
        view.update(original_semantic_digest=semantic_digest(original), candidate_semantic_digest=semantic_digest(candidate))
    except (KeyError, TypeError, ValueError):
        view.update(original_semantic_digest=None, candidate_semantic_digest=None)
    return view


def historical_view(case):
    state, event, payload, family = case['historical_reader_state'], case['event'], case['logical_payload'], case['event_type']
    return {'state': state, 'family': family,
            'expected_reader_id': 'reader.orchestrator.' + family.replace('.', '_') + '.history.v1@1.0.0',
            'event_payload_schema_id': event['payload_schema_id'],
            'expected_admission': {'event_type': family, 'family_revision': payload['schema_version'],
                                   'payload_schema_id': event['payload_schema_id'], 'event_id': event['event_id'],
                                   'scope_partition': case['scope_partition'], 'storage_instance_id': payload['storage_instance_id']},
            'expected_original_source_sha256': hashlib.sha256(packed(event)).hexdigest(),
            'expected_original_source_ref': 'seglog:' + event['event_id']}


def historical_full_view(case, root, formats):
    view = {'historical_state_valid': selected_validators(root, formats)['historical'].is_valid(case.get('historical_reader_state'))}
    try:
        view.update(historical_view(case))
    except (KeyError, TypeError, AttributeError):
        pass
    return view



def board_member_view(name, owner_defs, orchestrator_defs):
    definition = owner_defs.get(name)
    return {'definition': definition, 'orchestrator': orchestrator_defs.get(name), 'expected_id': f'pm.event_payload.{name}.v1',
            'definition_body': ({key: value for key, value in definition.items() if key not in ('$schema', '$id')}
                                if isinstance(definition, dict) else None)}


def coordination_storage_view(row, expected):
    return {'typed_row': typed_text(row), 'typed_expected_row': typed_text(expected)}



def successor_inputs(root):
    """The files successor_errors reads, loaded once; negatives change these in memory."""
    graph = json.loads((root / 'Plans/application_board_message_v2_graph.json').read_text())
    return {'doc': json.loads((root / 'Plans/application_board_message_v2.schema.json').read_text()), 'graph': graph,
            'documents': selected_documents(root),
            'file_sha256': {x['path']: hashlib.sha256((root / x['path']).read_bytes()).hexdigest() for x in graph['resources']},
            'storage': json.loads((root / 'Plans/storage_value_registry.json').read_text())}


def successor_view(inputs):
    doc, graph, documents, storage = inputs['doc'], inputs['graph'], inputs['documents'], inputs['storage']
    stages = list(doc['$defs']['OriginalCoordinationAppendSourceV2']['properties']['stage_custody']['properties'])
    method = graph['methods'][0]
    rows = [x for x in storage['families'] if x['family_id'] == 'crew_board_message_application_v2']
    row = rows[0] if len(rows) == 1 else None
    view = {'successor_reference_errors': reference_errors(doc, documents=documents), 'graph': graph,
            'expected_graph_sha256': semantic_hash('source_graph', {k: v for k, v in graph.items() if k != 'graph_sha256'}),
            'resource_paths': {x['path']: x['schema_uri'] for x in graph['resources']},
            'expected_resource_paths': {'Plans/' + name + '.schema.json': documents[name]['$id'] for name in (
                'application_board_message_v2', 'application_workflow_contracts', 'shared_integration_runtime',
                'coordination_projection_contracts')},
            'file_sha256': inputs['file_sha256'],
            'expected_edges': [{'from_role': a, 'to_role': b, 'interface_id': method['interface_id'],
                                'input_root_ref': method['input_root_ref'], 'output_root_ref': method['output_root_ref']}
                               for a, b in zip(stages, stages[1:])],
            'storage_member_count': len(rows),
            'storage_row': {k: v for k, v in row.items() if k != 'value_schema'} if row else None,
            'storage_value_schema_text': typed_text(row['value_schema']) if row else None,
            'wrapper_definition_text': typed_text(doc['$defs']['CrewBoardMessageStorageApplicationV2']),
            'storage_profile': storage['storage_profile']['family_profiles'].get('crew_board_message_application_v2')}
    return view


def successor_errors_from(inputs):
    view = successor_view(inputs)
    errors = run_rows(guards.SUCCESSOR_ROWS, view)
    errors += selected_definition_errors(inputs['documents'])
    errors += run_rows(guards.SUCCESSOR_GRAPH_ROWS, view)
    count = run_rows(guards.SUCCESSOR_STORAGE_COUNT_ROWS, view)
    if count:
        return errors + count
    return errors + run_rows(guards.SUCCESSOR_STORAGE_ROWS, view)



def application_shape_view(case, root, formats):
    v = selected_validators(root, formats)
    edition = '_v2' if (case['event_type'] == 'crew.board_message_posted' or
                         case['source'].get('schema_id') == 'pm.application_source.coordination_append.v2') else ''
    return {'board_branch': 'application', 'source_schema_valid': not list(v['source' + edition].iter_errors(case['source'])),
            'input_schema_valid': not list(v['input' + edition].iter_errors(case['source'].get('original_input'))),
            'wrapper_schema_valid': not list(v['wrapper' + edition].iter_errors(case['wrapper']))}


def board_project_view(case):
    payload, source = case['payload'], case['source']
    # Reached only after project_original_input_errors passed: the branch and that stage's verdict gate the rows.
    return {'payload': payload, 'source': source, 'message': source.get('original_input', {}), 'event_type': case['event_type'],
            'payload_message_ids': payload.get('message_ids', [payload.get('message_id')]),
            'board_branch': 'project', 'project_input_valid': True, 'application_shape_valid': False}


def board_application_view(case):
    payload, source, wrapper = case['payload'], case['source'], case['wrapper']
    message = source['original_input']
    edition = '_v2' if (case['event_type'] == 'crew.board_message_posted' or
                         source.get('schema_id') == 'pm.application_source.coordination_append.v2') else ''
    witness = case.get('accepted_source_witness', {})
    witnesses = case.get('stage_evidence_witnesses', {})
    prefix = 'crew_board_message.application.' + ('v2:' if edition else 'v1:')
    stage_expected = {}
    for name in REQUIRED_ORIGINAL_STAGES:
        stage_witness = witnesses.get(name, {})
        stage_expected[name] = {'typed_witness': typed_text(stage_witness.get('value')),
                                'typed_expected': typed_text(stage_witness_value(case, name)),
                                'witness_sha256': semantic_hash('accepted_source', stage_witness.get('value'))}
    # Reached only after the three application shape rows passed.
    return {'payload': payload, 'source': source, 'message': message, 'wrapper': wrapper, 'event_type': case['event_type'],
            'board_branch': 'application', 'application_shape_valid': True, 'project_input_valid': False,
            'wrapper_packed_size': len(app_packed(wrapper)),
            'source_scope_failures': scope_failures(source), 'wrapper_scope_failures': scope_failures(wrapper),
            'typed_wrapper_record': typed_text(wrapper['record']), 'typed_message': typed_text(message),
            'expected_input_digest': semantic_hash('accepted_source', message),
            'expected_output_digest': (None if source['original_output'] is None
                                       else semantic_hash('accepted_source', source['original_output'])),
            'expected_source_digest': semantic_hash('accepted_source', {k: x for k, x in source.items() if k != 'source_sha256'}),
            'witness': witness, 'typed_witness_value': typed_text(witness.get('value')),
            'expected_accepted_sha256': semantic_hash('accepted_source', witness.get('value')),
            'physical_record_sha256': case.get('physical_record_sha256'),
            'expected_physical_sha256': hashlib.sha256(app_packed(wrapper)).hexdigest(),
            'stage_witnesses': witnesses, 'stage_expected': stage_expected,
            'payload_message_ids': payload.get('message_ids', [payload.get('message_id')]),
            'wrapper_key': case['wrapper_key'],
            'expected_wrapper_key': prefix + ':'.join(value.encode().hex() for value in (
                wrapper['storage_instance_id'], wrapper['server_id'], message['thread_id'],
                message['crew_id'], message['run_id'], message['message_id']))}



def selected_definition_view(documents):
    selected_sha256 = {}
    for name, selection in SELECTED_SHARED_DEFINITIONS.items():
        selected = {x: documents[name].get('$defs', {}).get(x) for x in selection['names']}
        encoded = json.dumps(selected, sort_keys=True, separators=(',', ':'), ensure_ascii=False).encode()
        selected_sha256[name] = hashlib.sha256(encoded).hexdigest()
    return {'selected_sha256': selected_sha256,
            'pinned_sha256': {name: selection['sha256'] for name, selection in SELECTED_SHARED_DEFINITIONS.items()}}


def checkpoint_errors(case, root, formats):
    """The checkpoint read, through the guard tables (sweep part 2A). The stages and early stops are the original's."""
    view = recipe_view(case)
    recipe_errors = run_rows(guards.RECIPE_ROWS, view)
    if recipe_errors:
        return recipe_errors
    view.update(checkpoint_schema_view(case, root, formats))
    errors = run_rows(guards.CHECKPOINT_SCHEMA_ROWS, view)
    if errors:
        return errors
    view.update(checkpoint_identity_view(case))
    errors = run_rows(guards.CHECKPOINT_IDENTITY_ROWS, view)
    view.update(checkpoint_current_view(case))
    current = run_rows(guards.CHECKPOINT_CURRENT_ROWS, view)
    if current:
        return errors + current
    view.update(checkpoint_join_view(case, root, formats))
    errors += run_rows(guards.CHECKPOINT_JOIN_ROWS, view)
    frame = run_rows(guards.CHECKPOINT_FRAME_ROWS, view)
    if frame:
        return errors + frame
    view.update(checkpoint_coverage_view(case))
    return errors + run_rows(guards.CHECKPOINT_COVERAGE_ROWS, view)


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
    try:
        return hashlib.sha256(qualified_jcs(event.get('payload'))).hexdigest()
    except Refusal:
        return None


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
    view = {'row': row, 'expected_row': expected_row_copies(case)}
    assert tuple(view['expected_row']) == ROW_EVENT_COPY_FIELDS
    return run_rows(rows_named(guards.CHECKPOINT_JOIN_ROWS, ROW_EVENT_COPY_ROWS), view)


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
    return run_rows(rows_named(guards.CHECKPOINT_COVERAGE_ROWS, SEGMENT_IDENTITY_ROWS), frame_name_view(coverage, None))


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
    view = {'coverage': frontier['coverage'], 'anchor': anchor, 'anchor_source_selection': anchor['source_selection'],
            'frontier_source_selection': frontier['source_selection'], 'empty_gaps_sha256': EMPTY_GAPS_SHA256}
    return run_rows(rows_named(guards.CHECKPOINT_COVERAGE_ROWS, SELECTION_COPY_ROWS), view)


SEQUENCE_GAP_CODES = ('index_coverage_sequence_gap_retained', 'index_coverage_sequence_gap_order')


def sequence_gap_errors(event, coverage):
    """DO-P1F06: the frontier's gaps are free data (SP-278: legal gaps need actual manifest evidence this value does
    not carry), bounded here by two facts the value itself contradicts: a gap names sequence ids with no retained
    event, so it cannot hold the covered event's own sequence; and a gap's first id is not after its last. A bound
    that is not an integer (1.0, "1", true, null) makes no ordered range; it is refused as an unordered gap, never
    compared numerically."""
    view = {'coverage': coverage, 'event_sequence_id': event['sequence_id']}
    return run_rows(rows_named(guards.CHECKPOINT_COVERAGE_ROWS, SEQUENCE_GAP_ROWS), view)


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
    view = {'coverage': coverage, 'row': row, 'event_sequence_id': event['sequence_id'],
            'current_translation': node['translation']}
    return run_rows(rows_named(guards.CHECKPOINT_COVERAGE_ROWS, ROW_LOCATOR_ROWS), view)


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
    return run_rows(rows_named(guards.CHECKPOINT_COVERAGE_ROWS, GENERATION_COPY_ROWS),
                    generation_view(storage_instance_id, generations))


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
    recomputed from the event, never trusted as supplied, and compared by exact type, so 1344.0 or "1344" is not
    1344. The first four predicates locate the segment and frame those copies are read from.
    """
    data = packed(event)
    view = {'coverage': coverage, 'event_packed_size': len(data), 'expected_source_value_sha256': hashlib.sha256(data).hexdigest()}
    return run_rows(rows_named(guards.CHECKPOINT_COVERAGE_ROWS, COVERAGE_COPY_ROWS), view)


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
    the event and compared by exact type, so 7.0, "7", true or null is not 7 and true is not 1.
    The name is read from the last frame; DO-P1F04's `index_coverage_segment_name` joins the segment's name to it.
    Requires a non-null last frame: checkpoint_errors refuses a null one first.
    """
    view = frame_name_view(coverage, event)
    view['anchor'] = anchor
    return run_rows(rows_named(guards.CHECKPOINT_COVERAGE_ROWS, SEQUENCE_COPY_ROWS), view)


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
                    # DO-P1F4-S1 (sweep part 2B): SP-278's binding codec takes no float, so the builder cannot digest
                    # the frontier; the reader refuses the copy with a code at the checkpoint schema boundary (the
                    # shared uint64 slot gate), never by raising.
                    assert form == 'float', (case['case_id'], field, form)
                    assert checkpoint_errors(bad, root, formats) == ['checkpoint_schema'], (case['case_id'], field)
                    checks += 1
                    continue
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
        seal_original(recapture_history(moved))  # the writer's resequenced original, sealed as written
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
                    # DO-P1F4-S1 (sweep part 2B): refused with a code at the record's schema boundary, never raised.
                    assert form == 'float', (case['case_id'], field, form)
                    errors = checkpoint_errors(bad, root, formats)
                    assert errors and set(errors) & {'checkpoint_schema', 'index_row_schema'}, (case['case_id'], field, errors)
                    checks += 1
                    continue
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
    in step, as identity_copy_negatives does. The read token's storage instance is one invariant; sweep part 2A keeps
    it at one site (`read_token_storage_identity`, code `checkpoint_storage_identity`) and drops the token join's
    repeat of it, so its negative names that code alone. Yields like identity_copy_negatives.
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
        ('token_storage_instance_id', ['checkpoint_storage_identity'],
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
    # The name's form is joined to the segment's state: the state written another way.
    ('index_coverage_segment_name_state', 'read.checkpoint.generations.*.frontier.coverage.segments[].state',
     ('null', 'upper', 'trailing_lf')),
    # The generation id, rewritten consistently in every copy (rekey), in a form the recipe never gives.
    ('index_generation_id_recipe', 'read.checkpoint.generations{key}', ('upper', 'trailing_lf')),
    # On the compaction control: its origin, and its translation's target selection.
    ('index_generation_translation_origin', 'read.checkpoint.generations.*.origin', ('null', 'upper', 'trailing_lf')),
    ('index_translation_target_selection', 'read.checkpoint.generations.*.translation.target_selection_sha256',
     ('null', 'upper', 'trailing_lf')),
    # On a legal gap below the event: either bound in another type is an unordered gap.
    ('index_coverage_sequence_gap_order', 'read.checkpoint.generations.*.frontier.coverage.sequence_gaps[].first_sequence_id',
     ('float', 'string', 'bool', 'null')),
    ('index_coverage_sequence_gap_order', 'read.checkpoint.generations.*.frontier.coverage.sequence_gaps[].last_sequence_id',
     ('float', 'string', 'bool', 'null')),
)
# A form's holder when the positives leave it null or empty: the compaction control or the gap control.
TYPE_FORM_CARRIERS = {'.translation.': lambda case: compaction_control(case), '.origin': lambda case: compaction_control(case),
                      '.sequence_gaps[].': lambda case: gap_control(case)}


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


def type_form_case(case, code, path, form):
    """The case (or its carrier control) with the copy at `path` in another representation and every other copy kept:
    the generation id is rewritten in all its copies, and the segment name in all three."""
    carrier = next((build for marker, build in TYPE_FORM_CARRIERS.items() if marker in path), None)
    bad = carrier(case) if carrier is not None else copy.deepcopy(case)
    if path.endswith('{key}'):
        rekey(bad, type_form(bad['read']['checkpoint']['current_generation_id'], form))
        return bad
    holder, field = path_holder(bad, path)
    value = type_form(holder[field], form)
    holder[field] = value
    if code == 'index_coverage_segment_name_generation':
        coverage = frontier_coverage(bad)
        coverage['segments'][0]['segment_name'] = bad['read']['row']['source_locator']['segment_name'] = value
    return bad


def p1f06_type_form_checks(fixtures, schema, owner_module):
    """Exact type: each new guard alone refuses every other representation of its copy; through checkpoint_errors the
    strict checkpoint schema refuses what it does not admit, the weaker row schema adds `index_row_schema` beside the
    guard's own code, and an integral float makes the binding codec raise (DO-P1F4-S1, part 2)."""
    root, formats = owner_module.ROOT, owner_module.UTC_FORMAT
    v = selected_validators(root, formats)
    row_validator = index_row_validator(root, formats)
    checks = 0
    for case in fixtures['event_cases']:
        for code, path, forms in P1F06_TYPE_FORMS:
            for form in forms:
                bad = type_form_case(case, code, path, form)
                assert p1f06_guard_alone(code, bad) == [code], (case['case_id'], path, form, p1f06_guard_alone(code, bad))
                checks += 1
                try:
                    redigest(bad)
                except (TypeError, ValueError):
                    # DO-P1F4-S1 (sweep part 2B): refused with a code at the record's schema boundary, never raised.
                    assert form == 'float', (case['case_id'], path, form)
                    errors = checkpoint_errors(bad, root, formats)
                    assert errors and set(errors) & {'checkpoint_schema', 'index_row_schema'}, (case['case_id'], path, errors)
                    checks += 1
                    continue
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
    return seal_original(recapture_history(control))  # the writer's migrated original, sealed as written


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


@lru_cache(maxsize=4)
def index_row_validator(root, formats):
    """The event_record_index row validator, with CV-253's Storage profile at its persisted_at_utc (sweep part 2B)."""
    schema = index_row_schema(root)
    return StorageRecordValidator(StorageIntegerValidator(StrictValidator(schema, format_checker=formats), schema,
                                                          schema.get('$defs', {})))


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
        case['physical_record_sha256'] = hashlib.sha256(app_packed(case['wrapper'])).hexdigest()
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
    case['physical_record_sha256'] = hashlib.sha256(app_packed(case['wrapper'])).hexdigest()
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
    return seal_original(recapture_history(case), recipe)


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
        # Sweep part 2B (CV-1100): the shared parser refuses `-0` and `01`; `1.0` and `1e0` are JSON numbers, which
        # the occurrence integer slot refuses (`current_integer`, integer_type). Either way the token never lands.
        try:
            document = canonical_loads('{"occurrence":' + token + '}')
        except ValueError:
            assert token in ('-0', '01'), ('parser_refused_valid_number', test['name'])
        else:
            assert token in ('1.0', '1e0'), ('accepted_noncanonical_number', test['name'])
            assert integer_slot_errors(payload_definitions()[base['definition']], document, payload_definitions()) == [
                'integer_type'], ('slot_accepted_number', test['name'])
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


# ---- Sweep part 2B witnesses (CV-1101 date-time profiles, CV-1100 numbers, SP-1101 dispatch) --------------------

# The inventory's Storage nodes among the resources this lane validates (see `storage_timestamp_errors`).
DO_VALIDATED_RESOURCES = (
    'Plans/event_record.schema.json', 'Plans/event_record_index_checkpoint.schema.json',
    'Plans/orchestrator_event_payloads.schema.json', 'Plans/orchestrator_historical_read.schema.json',
    'Plans/application_board_message_v2.schema.json', 'Plans/application_workflow_contracts.schema.json',
    'Plans/application_workflow_sources.schema.json', 'Plans/shared_integration_runtime.schema.json',
    'Plans/coordination_projection_contracts.schema.json')
DO_STORAGE_SITES = {
    ('Plans/event_record.schema.json', ''), ('Plans/event_record.schema.json', '/$defs/event_record_1_0_0_compatibility_reader'),
    ('Plans/storage_value_registry.json', '/families/8/value_schema')}
STORAGE_CLASSES = ('EventRecord', 'event_record_index', 'original_storage_fields', 'Storage issued original fields')


def storage_profile_sites_errors(root):
    """The Storage sites this lane wraps are exactly the inventory's Storage nodes among its validated resources (the
    inventory is read as data; its whole-tree gate is `pm_event_datetime_inventory.py`)."""
    inventory = json.loads((root / 'Plans/event_datetime_inventory.json').read_text())
    sites = {(row['path'], row['pointer']) for row in inventory['nodes'] if row['classification'] in STORAGE_CLASSES
             and (row['path'] in DO_VALIDATED_RESOURCES or (row['path'], row['pointer']) in DO_STORAGE_SITES)}
    registry = json.loads((root / 'Plans/storage_value_registry.json').read_text())
    errors = [] if sites == DO_STORAGE_SITES else ['storage_sites:' + json.dumps(sorted(sites ^ DO_STORAGE_SITES))]
    if registry['families'][8]['family_id'] != 'event_record_index':
        errors.append('storage_sites:families/8 is not event_record_index')
    return errors


PAYLOAD_TIME_ACCEPTED = (
    '2026-11-04t00:00:00z', '2026-11-04T05:30:00+05:30', '2026-11-03T19:00:00-05:00', '2016-12-31T23:59:60Z',
    '2017-01-01T05:29:60+05:30', '2026-11-04T00:00:00.000000000000000000001Z', '0000-01-01T00:00:00Z')
PAYLOAD_TIME_REFUSED = (
    '2026-11-04T24:00:00Z', '2026-11-04T00:00:00Z\n', '2026-11-04T00:00:60Z', '2026-11-04T00:00:00,5Z',
    '2026-11-04T00:00:00+24:00', '2026-11-04T00:00:00+05:60', '2026-11-04T00:00:00', '2026-02-29T00:00:00Z',
    '2016-12-31T23:59:60+01:00', ' 2026-11-04T00:00:00Z', '2026-11-04T00:00:00.Z')
STORAGE_TIME_ACCEPTED = ('2026-11-04T00:00:00Z', '2016-12-31T23:59:60Z', '2026-11-04t00:00:00.123456789012Z')
STORAGE_TIME_REFUSED = ('2026-11-04T00:00:00+00:00', '2026-11-04T00:00:00-00:00', '2026-11-04T00:00:00z',
                        '2026-11-04T05:30:00+05:30', '2026-11-04T24:00:00Z', '2026-11-04T00:00:00Z\n')


class StrSubclass(str):
    pass


def datetime_profile_checks(fixtures, schema, owner_module):
    """CV-1101 / CV-253 witnesses, each one change from a valid case."""
    root, formats = owner_module.ROOT, owner_module.UTC_FORMAT
    checks = 0
    assert not storage_profile_sites_errors(root), storage_profile_sites_errors(root)
    checks += 1
    v = selected_validators(root, formats)
    payload_fields = {(c['definition'], field) for c in fixtures['event_cases']
                      for field, node in schema['$defs'][c['definition']]['properties'].items() if node.get('format') == 'date-time'}
    assert {f for _, f in payload_fields} == {'occurred_at_utc', 'read_at_utc', 'archived_before_utc'}, payload_fields
    for case in fixtures['event_cases']:
        validator = StrictValidator(schema['$defs'][case['definition']], format_checker=formats)
        for field in [f for d, f in payload_fields if d == case['definition']]:
            for value, valid in [(x, True) for x in PAYLOAD_TIME_ACCEPTED] + [(x, False) for x in PAYLOAD_TIME_REFUSED]:
                payload = dict(case['logical_payload'], **{field: value})
                assert validator.is_valid(payload) is valid, (case['case_id'], field, value)
                event = dict(case['event'], payload=payload) if case['event']['payload_ref'] is None else case['event']
                if case['event']['payload_ref'] is None:
                    assert retry_shape_valid(event) is valid, (case['case_id'], field, value)
                checks += 2
            payload = dict(case['logical_payload'], **{field: StrSubclass(case['logical_payload'][field])})
            assert not validator.is_valid(payload), (case['case_id'], field, 'str subclass')
            checks += 1
        # The envelope's source time takes the broad profile; with the payload's copy equal, the append is valid.
        moved = copy.deepcopy(case)
        moved['logical_payload']['occurred_at_utc'] = moved['event']['occurred_at_utc'] = '2026-11-04T05:30:00+05:30'
        if moved['event']['payload_ref'] is None:
            moved['event']['payload'] = copy.deepcopy(moved['logical_payload'])
            assert event_errors(moved, schema, owner_module.identity, owner_module.retry_allowed, root, formats) == [], case['case_id']
            checks += 1
        # Storage-assigned fields take storage_utc_z, on the envelope and the index row.
        for field in STORAGE_TIMESTAMP_FIELDS:
            for value, valid in [(x, True) for x in STORAGE_TIME_ACCEPTED] + [(x, False) for x in STORAGE_TIME_REFUSED]:
                bad = copy.deepcopy(case); bad['event'][field] = value
                assert v['event'].is_valid(bad['event']) is valid, (case['case_id'], field, value)
                assert event_errors(bad, schema, owner_module.identity, owner_module.retry_allowed, root, formats) == (
                    [] if valid else ['event_schema']), (case['case_id'], field, value)
                assert retry_shape_valid(bad['event']) is valid, (case['case_id'], field, value)
                checks += 3
        row = case['read']['row']
        for value, valid in [(x, True) for x in STORAGE_TIME_ACCEPTED] + [(x, False) for x in STORAGE_TIME_REFUSED]:
            assert index_row_validator(root, formats).is_valid(dict(row, persisted_at_utc=value)) is valid, (case['case_id'], value)
            checks += 1
    for base in fixtures['board_storage_cases']:
        if base['payload']['scope'] == 'project':
            for value, valid in [(x, True) for x in PAYLOAD_TIME_ACCEPTED] + [(x, False) for x in PAYLOAD_TIME_REFUSED]:
                bad = {'source': copy.deepcopy(base['source'])}
                bad['source']['original_input']['created_at'] = value
                assert (project_original_input_errors(bad, formats) == []) is valid, value
                checks += 1
    return checks


def corpus_number_values(root):
    """The number-scope values of the shared corpus: raw spellings (token, parse, parse_token, slot, json_number) and
    exact integers (integer, uint64), plus three 4,400-digit integers."""
    corpus = json.loads((root / 'Plans/event_number_recipe_corpus.json').read_text())
    raws, ints = [], []
    for case in corpus['cases']:
        if case.get('date_time_profile'):
            continue
        if case.get('op') in ('token', 'parse', 'parse_token', 'slot') and type(case.get('raw')) is str:
            raws.append(case['raw'])
        if case.get('op') == 'json_number' and type(case.get('token')) is str:
            raws.append(case['token'])
        if case.get('op') in ('integer', 'uint64') and type(case.get('value')) is dict and '@int' in case['value']:
            ints.append(case['value']['@int'])
    long = '1' + '0' * 4399
    raws += [long, '-' + long]
    ints += [long, str((1 << 64) - 1), str(1 << 64)]
    return list(dict.fromkeys(raws)), list(dict.fromkeys(ints))


def raw_case_text(case, slot_token, sequence_token=None):
    """The case as raw fixture text, with a raw number token written at the payload's `occurrence` slot (and, given,
    at the event's Storage sequence_id), so it enters through the checker's own raw ingress (`fixture_loads`)."""
    marker, sequence_marker = '"__DO_P2B_SLOT__"', '"__DO_P2B_SEQUENCE__"'
    case = copy.deepcopy(case)
    case['logical_payload']['occurrence'] = '__DO_P2B_SLOT__'
    if case['event']['payload_ref'] is None:
        case['event']['payload'] = copy.deepcopy(case['logical_payload'])
    if sequence_token is not None:
        case['event']['sequence_id'] = '__DO_P2B_SEQUENCE__'
    text = json.dumps({'event_cases': [case]}).replace(marker, slot_token)
    return text.replace(sequence_marker, sequence_token) if sequence_token is not None else text


def expected_slot_outcome(token, family, payload, identity):
    """The outcome composed from the shared helpers alone: the raw parse, then `current_integer` at the slot with its
    bounds (occurrence: minimum 1), then the identity preimage's qualified JCS."""
    try:
        value = loads_current_json(token)
    except Refusal:
        return 'load_refused'
    try:
        current_integer(value, minimum=1)
    except Refusal:
        return 'number_domain'
    try:
        identity(family, dict(payload, occurrence=value))
    except Refusal:
        return 'number_domain'
    return 'accepted'


def number_corpus_checks(fixtures, schema, owner_module):
    """The shared number corpus through the complete append and retry routes of one case per family, with
    expectations composed from the shared helpers (not from this lane)."""
    root, formats = owner_module.ROOT, owner_module.UTC_FORMAT
    raws, ints = corpus_number_values(root)
    seen, bases = set(), []
    for case in fixtures['event_cases']:
        if case['event_type'] not in seen and case['event']['payload_ref'] is None:
            seen.add(case['event_type']); bases.append(case)
    totals = collections.Counter()
    for base in bases:
        family = base['event_type']
        for token in raws + ints:
            expected = expected_slot_outcome(token, family, base['logical_payload'], owner_module.identity)
            try:
                loaded = fixture_loads(raw_case_text(base, token))['event_cases'][0]
            except ValueError:
                assert expected == 'load_refused', (family, token[:40], expected)
                totals['load_refused'] += 1
                continue
            assert expected != 'load_refused', (family, token[:40])
            if expected == 'accepted':
                key, event_id = owner_module.identity(family, loaded['logical_payload'])
                loaded['event'].update(idempotency_key=key, event_id=event_id)
            errors = event_errors(loaded, schema, owner_module.identity, owner_module.retry_allowed, root, formats)
            assert errors == ([] if expected == 'accepted' else ['number_domain']), (family, token[:40], errors)
            status = retry_outcome(base['event'], loaded['event'])['status']
            assert (status == 'number_domain') is (expected == 'number_domain'), (family, token[:40], status)
            totals[expected] += 1
        for token in ints:
            try:
                expected_valid = storage_uint64(current_integer_token(token)) is not None
            except Refusal:
                expected_valid = False
            loaded = None
            try:
                loaded = fixture_loads(raw_case_text(base, json.dumps(base['logical_payload']['occurrence']), token))['event_cases'][0]
            except ValueError:
                assert not expected_valid, (family, 'sequence', token[:40])
                totals['sequence_load_refused'] += 1
                continue
            errors = event_errors(loaded, schema, owner_module.identity, owner_module.retry_allowed, root, formats)
            assert errors == ([] if expected_valid else ['event_storage_sequence']), (family, 'sequence', token[:40], errors)
            retry = retry_outcome(base['event'], loaded['event'])
            assert (retry['status'] == 'original_result') is expected_valid, (family, 'sequence', token[:40], retry['status'])
            totals['sequence_accepted' if expected_valid else 'sequence_refused'] += 1
    return sum(totals.values()) * 2, dict(totals), len(raws), len(ints)


def long_integer_checks(fixtures, schema, owner_module):
    """The 4,400-digit integer (DX/DS15/DF/DM class): every DO route refuses it with a code, none raises."""
    root, formats = owner_module.ROOT, owner_module.UTC_FORMAT
    long = JsonNumber('1' + '0' * 4399, True).exact()
    checks = 0
    for case in fixtures['event_cases'][:5]:
        for value in (long, -long):
            bad = copy.deepcopy(case); bad['logical_payload']['occurrence'] = value
            if bad['event']['payload_ref'] is None:
                bad['event']['payload'] = copy.deepcopy(bad['logical_payload'])
            assert event_errors(bad, schema, owner_module.identity, owner_module.retry_allowed, root, formats) == ['number_domain']
            assert retry_outcome(case['event'], bad['event'])['status'] == 'number_domain'
            checks += 2
        # A retained original holding one is read through custody (unsealed here) and refused with a code.
        retained = copy.deepcopy(case); retained['logical_payload']['occurrence'] = long
        if retained['event']['payload_ref'] is None:
            retained['event']['payload'] = copy.deepcopy(retained['logical_payload'])
        assert historical_read_errors(retained, schema, owner_module) == ['historical_original_recipe']
        assert checkpoint_errors(retained, root, formats) == ['historical_original_recipe']
        checks += 2
        # The legacy and current identity recipes refuse it (Refusal), never raise another exception.
        for recipe in (LEGACY_RECIPE, CURRENT_RECIPE):
            try:
                owner_module.historical_identity(case['event_type'], retained['logical_payload'], recipe)
            except Refusal:
                checks += 1
            else:
                raise AssertionError(('long_identity', recipe))
    for base in fixtures['board_storage_cases'][:2]:
        bad = copy.deepcopy(base); bad['payload']['occurrence'] = long
        assert owner_module.board_join_errors(bad) == ['number_domain'], base['event_type']
        checks += 1
    return checks


def dispatch_checks(fixtures, schema, owner_module):
    """SP-1101: custody selects the recipe; a label, a self-hash or a coherent forgery selects nothing."""
    root, formats = owner_module.ROOT, owner_module.UTC_FORMAT
    checks = 0
    for case in fixtures['retained_event_cases'][:40]:
        custody, refusal = resolve_original(case)
        assert refusal is None and custody.recipe.identity_recipe == case['historical_reader_state']['original_identity_recipe']
        # The label alone names the other recipe: refused, and the custody recipe still selects.
        flipped = copy.deepcopy(case); state = flipped['historical_reader_state']
        state['original_identity_recipe'] = LEGACY_RECIPE if state['original_identity_recipe'] == CURRENT_RECIPE else CURRENT_RECIPE
        assert resolve_original(flipped)[0].recipe.identity_recipe == case['historical_reader_state']['original_identity_recipe']
        assert historical_read_errors(flipped, schema, owner_module) == ['historical_original_recipe']
        assert run_rows(guards.RECIPE_ROWS, recipe_view(flipped)) == ['historical_original_recipe']
        assert refusing_rows(guards.RECIPE_ROWS, recipe_view(flipped)) == ['recipe_disclosed']
        # The label and its whole evidence rewritten coherently by the writer's own disclosure builder: still refused.
        coherent = copy.deepcopy(flipped); record_recipe(coherent, coherent['historical_reader_state']['original_identity_recipe'])
        assert historical_read_errors(coherent, schema, owner_module) == ['historical_original_recipe']
        # A coherent forgery of the original's bytes (every copy and self-hash rewritten, nothing sealed).
        forged = copy.deepcopy(case); forged['event']['observed_at_utc'] = '2026-11-04T05:06:07.123456789Z'
        recapture_history(forged)
        assert resolve_original(forged)[1] == 'original_authority'
        assert refusing_rows(guards.RECIPE_ROWS, recipe_view(forged)) == ['recipe_supported']
        assert historical_read_errors(forged, schema, owner_module) == ['historical_original_recipe']
        assert checkpoint_errors(forged, root, formats) == ['historical_original_recipe']
        # The same bytes sealed by the writer read normally (the seal is withdrawn again afterwards).
        sealed = ORIGINAL_CUSTODY['seglog:' + forged['event']['event_id']]
        commitment = hashlib.sha256(packed(forged['event'])).hexdigest()
        assert commitment not in sealed
        try:
            assert historical_read_errors(seal_original(copy.deepcopy(forged)), schema, owner_module) == []
        finally:
            sealed.pop(commitment, None)
        checks += 9
    # A recipe tuple with no frozen verifier, and a verifier that cannot recompute, refuse through the dispatcher.
    case = fixtures['retained_event_cases'][0]
    entry = ORIGINAL_CUSTODY['seglog:' + case['event']['event_id']][hashlib.sha256(packed(case['event'])).hexdigest()]
    saved = entry['recipe']
    try:
        entry['recipe'] = recipe_tuple(dict(case['event'], schema_version='9.9.9'), saved.identity_recipe)
        assert resolve_original(case)[1] == 'recipe_unknown'
        other = LEGACY_RECIPE if saved.identity_recipe == CURRENT_RECIPE else CURRENT_RECIPE
        entry['recipe'] = recipe_tuple(case['event'], other)
        assert resolve_original(case)[1] in ('original_verification', None)
    finally:
        entry['recipe'] = saved
    checks += 2
    return checks


def physical_profile_checks(fixtures):
    """SP-236 / CV-366 / SP-1100: the lane's bytes are the shared profiles' and decode canonically."""
    checks = 0
    assert packed(1.0) == b'\xca\x3f\x80\x00\x00' and app_packed(1.0) == b'\xcb\x3f\xf0\x00\x00\x00\x00\x00\x00'
    checks += 1
    for key in ('event_cases', 'retained_event_cases', 'compatibility_event_cases'):
        for case in fixtures[key]:
            data = packed(case['event'])
            assert decode_storage_value(data, profile=EVENT_VALUE) == case['event'], case['case_id']
            for entry in case['payload_packs'].values():
                if entry['media_type'] == 'application/msgpack':
                    assert pack_entry(entry['value'])['blake3_id'] == entry['blake3_id'], case['case_id']
            checks += 1
    for case in fixtures['board_storage_cases']:
        if 'wrapper' in case:
            assert hashlib.sha256(app_packed(case['wrapper'])).hexdigest() == case['physical_record_sha256']
            checks += 1
    return checks


def part_2b_checks(fixtures, schema, owner_module):
    checks = datetime_profile_checks(fixtures, schema, owner_module)
    corpus_checks, totals, raws, ints = number_corpus_checks(fixtures, schema, owner_module)
    print(json.dumps({'number_corpus': totals, 'raw_spellings': raws, 'exact_integers': ints}), file=sys.stderr)
    checks += corpus_checks
    checks += long_integer_checks(fixtures, schema, owner_module)
    checks += dispatch_checks(fixtures, schema, owner_module)
    checks += physical_profile_checks(fixtures)
    return checks
