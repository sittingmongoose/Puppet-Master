"""Relational static oracles for six unadmitted DCW contracts; no native proof.

Synthetic authority inputs stand for independently authenticated owner/store adapters.
They test composition, never establish that those native adapters exist or ran.
"""
import base64
import binascii
import copy
import hashlib
import json
import re
import struct
from blake3 import blake3
from pathlib import Path
from functools import lru_cache
from jsonschema import Draft202012Validator, FormatChecker, validators
from jsonschema.exceptions import ValidationError
from referencing import Registry, Resource
from referencing.exceptions import Unresolvable
from referencing.jsonschema import DRAFT202012
from contextvars import ContextVar
from contextlib import contextmanager
from functools import wraps
import pm_event_numbers as numbers
import pm_dcw_number_custody as number_custody
import pm_dcw_guard_rows as guard_rows
ROOT = Path(__file__).resolve().parents[1]
FORMAT = FormatChecker()
SCHEMAS = [ROOT / 'Plans/event_record.schema.json', ROOT / 'Plans/event_append_receipt_contracts.schema.json', ROOT / 'Plans/event_record_index_checkpoint.schema.json', *sorted((ROOT / 'Plans/dcw').glob('*.schema.json')), *sorted((ROOT / 'Plans/event_payloads/bundle_revision').glob('*.schema.json')), *sorted((ROOT / 'Plans/event_payloads/planning_wizard').glob('*.schema.json'))]
RESOURCES = Registry().with_resources(((json.loads(p.read_text())['$id'], Resource.from_contents(json.loads(p.read_text()))) for p in SCHEMAS))

class Refusal(Exception):
    pass

@lru_cache(maxsize=None)
def load(path):
    value = json.loads((ROOT / path).read_text())
    if path == 'Plans/dcw_event_contract_fixtures.json':
        for row in value['families']:
            install_fixture_originals(row['positive'], legacy=True)
    return value
HISTORICAL = ContextVar('dcw_historical_original', default=False)
PASSIVE = ContextVar('dcw_passive_original', default=False)
ORIGINAL_DIGESTS = ContextVar('dcw_authenticated_original_digests', default=None)
SHARED_SCHEMAS = ('Plans/event_record.schema.json', 'Plans/event_append_receipt_contracts.schema.json')

def frozen_shared(schema):
    if type(schema) is dict:
        return {k: frozen_shared(v) for k, v in schema.items() if not (k == 'format' and v == 'pm-uint')}
    if type(schema) is list:
        return [frozen_shared(v) for v in schema]
    return schema

def historical_boundary(function):

    @wraps(function)
    def wrapped(*args, **kwargs):
        operation = kwargs.get('operation', args[2] if function.__name__ == 'verify' and len(args) > 2 else args[1])
        token = HISTORICAL.set(operation in ('read', 'rebuild', 'compatibility_read', 'retry'))
        passive = PASSIVE.set(operation in ('read', 'rebuild', 'compatibility_read'))
        digests = ORIGINAL_DIGESTS.set({}) if ORIGINAL_DIGESTS.get() is None else None
        try:
            return function(*args, **kwargs)
        finally:
            HISTORICAL.reset(token)
            PASSIVE.reset(passive)
            if digests is not None:
                ORIGINAL_DIGESTS.reset(digests)
    return wrapped

def _current_type(validator, expected, instance, schema):
    types = [expected] if type(expected) is str else expected
    if 'integer' in types and instance is not None:
        try:
            numbers.current_integer(instance, minimum=schema.get('minimum'), maximum=schema.get('maximum'))
        except numbers.Refusal:
            if not any((validator.is_type(instance, t) for t in types if t != 'integer')):
                yield ValidationError('current integer slot refuses type, spelling or range')
                return
    yield from Draft202012Validator.VALIDATORS['type'](validator, expected, instance, schema)

def _safe_keyword(keyword):
    original = Draft202012Validator.VALIDATORS[keyword]

    def checked(validator, expected, instance, schema):
        try:
            yield from original(validator, expected, instance, schema)
        except ValueError as exc:
            if 'integer string conversion' not in str(exc):
                raise
            yield ValidationError('schema numeric constraint refused an exact large integer')
    return checked
CurrentValidator = validators.extend(Draft202012Validator, dict(type=_current_type, **{key: _safe_keyword(key) for key in ('minimum', 'maximum', 'exclusiveMinimum', 'exclusiveMaximum', 'enum', 'const', 'multipleOf')}))
FrozenValidator = validators.extend(Draft202012Validator, {key: _safe_keyword(key) for key in ('minimum', 'maximum', 'exclusiveMinimum', 'exclusiveMaximum', 'enum', 'const', 'multipleOf')})

def check_schema(path, value, definition=None):
    schema = load(path)
    resources = RESOURCES
    historical = HISTORICAL.get() and path != 'Plans/event_record_index_checkpoint.schema.json'
    if not historical:
        schema = current_schema(schema)
        resources = resources.with_resources(((uri, Resource.from_contents(current_schema(resources[uri].contents))) for uri in resources))
    if historical or path.startswith('Plans/dcw/'):
        documents = [frozen_shared(load(p)) for p in SHARED_SCHEMAS]
        resources = resources.with_resources(((s['$id'], Resource.from_contents(s)) for s in documents))
        if path in SHARED_SCHEMAS:
            schema = frozen_shared(schema)
    if definition:
        schema = {'$ref': schema['$id'] + '#/$defs/' + definition}
    try:
        (FrozenValidator if historical else CurrentValidator)(schema, registry=resources, format_checker=FORMAT).validate(value)
    except (ValidationError, ValueError) as exc:
        if isinstance(exc, ValueError) and (not isinstance(exc, ValidationError)) and ('integer string conversion' not in str(exc)):
            raise
        guard_rows.enforce('OE001', {'site': 'OE001', 'code': 'schema', 'v0': 'refused'})
    else:
        guard_rows.enforce('OE001', {'site': 'OE001', 'code': 'schema', 'v0': None})

def schema_references(schema, resolver=None):
    """Resolve even unused definitions; schema-shape validation is insufficient."""
    if resolver is None:
        resolver = RESOURCES.resolver(schema['$id'])
    if isinstance(schema, dict):
        resolver = resolver.in_subresource(Resource.from_contents(schema, default_specification=DRAFT202012))
        if '$ref' in schema:
            try:
                resolver.lookup(schema['$ref'])
            except Unresolvable as exc:
                guard_rows.enforce('OE002', {'site': 'OE002', 'code': 'unresolved_schema_ref', 'v0': 'refused'})
            else:
                guard_rows.enforce('OE002', {'site': 'OE002', 'code': 'unresolved_schema_ref', 'v0': None})
        for value in schema.values():
            schema_references(value, resolver)
    elif isinstance(schema, list):
        for value in schema:
            schema_references(value, resolver)

def writer_policy(policy):
    guard_rows.enforce('O001', {'site': 'O001', 'code': 'replay_only_not_appendable', 'v0': policy})
    guard_rows.enforce('O002', {'site': 'O002', 'code': 'writer_policy', 'v0': policy})

def secret_free(value):
    if isinstance(value, str):
        guard_rows.enforce('O003', {'site': 'O003', 'code': 'secret_or_path', 'v0': 'matched' if re.search('^(?:/|[A-Za-z]:[\\\\/]|file://|sk-[A-Za-z0-9]{8,}|Bearer\\s)|://[^/]*@', value) is not None else None})
    elif isinstance(value, dict):
        for item in value.values():
            secret_free(item)
    elif isinstance(value, list):
        for item in value:
            secret_free(item)

def digest(value):
    return hashlib.sha256(canonical_json(value, sort_keys=True)).hexdigest()

def compact_digest(value):
    return hashlib.sha256(canonical_json(value)).hexdigest()

def canonical_msgpack(value):
    """SP-236/SP-1100 EventRecord physical profile, including float kind/sign."""
    try:
        result = numbers.storage_value_bytes(value, profile=numbers.EVENT_VALUE)
    except numbers.Refusal as exc:
        guard_rows.enforce('OE003', {'site': 'OE003', 'code': exc.reason, 'v0': 'refused'})
    else:
        guard_rows.enforce('OE003', {'site': 'OE003', 'code': 'accept', 'v0': None})
    return result

def commitment(event):
    domain = 'pm.storage.original_event_value_commitment.v1'
    codec = 'pm.seglog_frame_v2.event_value.canonical_msgpack.v1'
    preimage = [domain, '1.0.0', codec, event['schema_id'], event['schema_version'], event]
    return dict(schema_id=domain, schema_version='1.0.0', codec=codec, domain=domain, event_schema_id=event['schema_id'], event_schema_version=event['schema_version'], sha256=numbers.full_value_commitment(event))
SEMANTIC_FIELDS = 'event_type scope_kind project_id thread_id run_id node_id attempt_id actor_ref requested_account_ref effective_account_ref occurred_at_utc producer_sequence_id correlation_id causation_event_id parent_event_id idempotency_key payload_schema_id payload payload_ref redaction_profile migration'.split()

def semantic_digest(event):
    """CV-317/CV-1100: the unchanged complete producer projection."""
    try:
        result = numbers.producer_semantic_digest(event)
    except numbers.Refusal as exc:
        guard_rows.enforce('OE004', {'site': 'OE004', 'code': exc.reason, 'v0': 'refused'})
    else:
        guard_rows.enforce('OE004', {'site': 'OE004', 'code': 'accept', 'v0': None})
    return result


def original_semantic_digest(event, authority=None, slot=None):
    """Use a verified original recipe; current callers still use semantic_digest."""
    key = hashlib.sha256(canonical_msgpack(event)).hexdigest()
    cache = ORIGINAL_DIGESTS.get()
    if cache is not None and key in cache:
        return cache[key]
    if authority is not None and slot is not None:
        custody = authority['custody'].get(event['event_id'])
        if custody is not None:
            try:
                selected = number_custody.resolve(event, custody['first_append_receipt'],
                    authority['storage_instance_id'], slot['source_ref'])
            except numbers.Refusal:
                pass
            else:
                return number_custody.selected_semantic_digest(selected)
    return semantic_digest(event)

def event_identity(payload):
    name = payload['event_type']
    if name.startswith('bundle.'):
        fields = ['project_id', 'thread_id', 'bundle_id', 'revision_id', 'phase_sequence']
        prefix = 'evt_bundle_revision_'
    else:
        fields = ['project_id', 'planning_run_id', 'thread_id', 'request_id']
        prefix = 'evt_' + name.replace('.', '_') + '_'
    h = compact_digest([name] + [payload[k] for k in fields])
    return (prefix + h, name + ':' + h)

def event_reference(row, event):
    """A compact JSON descriptor fits the existing nullable-string envelope slot."""
    try:
        ref = numbers.loads_current_json(event['payload_ref'])
    except (TypeError, ValueError) as exc:
        guard_rows.enforce('OE005', {'site': 'OE005', 'code': 'event_payload_reference_encoding', 'v0': 'refused'})
    else:
        guard_rows.enforce('OE005', {'site': 'OE005', 'code': 'event_payload_reference_encoding', 'v0': None})
    check_schema(row['schema'], ref, 'payload_reference')
    guard_rows.enforce('O004', {'site': 'O004', 'code': 'event_payload_reference_encoding', 'v0': event['payload_ref'], 'v1': canonical_json(ref, sort_keys=True).decode('utf-8')})
    return ref

def event_body(row, event, authority=None):
    """Validate the actual SP-026 bytes, or resolve a verified SP-337 body.

    The supplied adapter observations are synthetic; pack/index durability and
    original custody still need independent native evidence before admission.
    """
    if event['payload_ref'] is None:
        check_schema(row['schema'], event['payload'])
        guard_rows.enforce('O005', {'site': 'O005', 'code': 'inline_limit', 'v0': canonical_msgpack(event['payload'])})
        return event['payload']
    check_schema(row['schema'], event['payload'], 'referenced_stub')
    ref = event_reference(row, event)
    payload = (authority or {}).get('event_payloads', {}).get(ref['blake3'])
    guard_rows.enforce('O006', {'site': 'O006', 'code': 'event_payload_missing', 'v0': payload})
    guard_rows.enforce('O007', {'site': 'O007', 'code': 'event_payload_unavailable', 'v0': payload['readable']})
    guard_rows.enforce('O008', {'site': 'O008', 'code': 'event_payload_not_durable', 'v0': payload['durable']})
    guard_rows.enforce('O009', {'site': 'O009', 'code': 'event_payload_not_durable', 'v0': payload['index_durable']})
    try:
        raw = bytes.fromhex(payload['bytes_hex'])
    except (KeyError, TypeError, ValueError) as exc:
        guard_rows.enforce('OE006', {'site': 'OE006', 'code': 'event_payload_encoding', 'v0': 'refused'})
    else:
        guard_rows.enforce('OE006', {'site': 'OE006', 'code': 'event_payload_encoding', 'v0': None})
    guard_rows.enforce('O010', {'site': 'O010', 'code': 'event_payload_size', 'v0': raw, 'v1': ref['byte_size']})
    guard_rows.enforce('O011', {'site': 'O011', 'code': 'event_payload_digest', 'v0': blake3(raw).hexdigest(), 'v1': ref['blake3']})
    check_schema(row['schema'], payload['body'])
    guard_rows.enforce('O012', {'site': 'O012', 'code': 'event_payload_encoding', 'v0': raw, 'v1': canonical_msgpack(payload['body'])})
    secret_free(payload['body'])
    return payload['body']

def envelope(row, event, compatibility=False, authority=None):
    check_schema('Plans/event_record.schema.json', event)
    if not HISTORICAL.get():
        admit_storage_sequence(event['sequence_id'])
    payload = event_body(row, event, authority)
    guard_rows.enforce('O013', {'site': 'O013', 'code': 'family', 'v0': event['event_type'], 'v1': payload['event_type']})
    guard_rows.enforce('O014', {'site': 'O014', 'code': 'family', 'v0': payload['event_type'], 'v1': row['event_type']})
    guard_rows.enforce('O015', {'site': 'O015', 'code': 'dispatch', 'v0': event['payload_schema_id'], 'v1': payload['schema_id']})
    guard_rows.enforce('O016', {'site': 'O016', 'code': 'identity', 'v0': event['event_id'], 'v1': event['idempotency_key'], 'v2': event_identity(payload)})
    guard_rows.enforce('O017', {'site': 'O017', 'code': 'scope', 'v0': event['scope_kind']})
    for k in ('project_id', 'thread_id'):
        guard_rows.enforce('O018', {'site': 'O018', 'code': 'scope', 'v0': event[k], 'v1': payload[k]})
    for k in ('run_id', 'node_id', 'attempt_id', 'requested_account_ref', 'effective_account_ref'):
        guard_rows.enforce('O019', {'site': 'O019', 'code': 'runtime_scope', 'v0': event[k]})
    guard_rows.enforce('O020', {'site': 'O020', 'code': 'causation', 'v0': event['causation_event_id'], 'v1': event['parent_event_id']})
    guard_rows.enforce('O021', {'site': 'O021', 'code': 'causation', 'v0': event['parent_event_id'], 'v1': payload['predecessor_event_id']})
    guard_rows.enforce('O022', {'site': 'O022', 'code': 'original_time', 'v0': event['occurred_at_utc'], 'v1': payload['ts']})
    guard_rows.enforce('O023', {'site': 'O023', 'code': 'correlation', 'v0': event['correlation_id'], 'v1': payload['revision_id' if row['event_type'].startswith('bundle.') else 'request_id']})
    guard_rows.enforce('O024', {'site': 'O024', 'code': 'producer_sequence', 'v0': typed_observation(event['producer_sequence_id']), 'v1': typed_observation(payload.get('phase_sequence'))})
    guard_rows.enforce('O025', {'site': 'O025', 'code': 'redaction', 'v0': event['redaction_profile']})
    if compatibility:
        guard_rows.enforce('O026', {'site': 'O026', 'code': 'writer_policy', 'v0': event['replay_policy']})
    elif PASSIVE.get():
        guard_rows.enforce('H001', {'site': 'H001', 'code': 'writer_policy', 'v0': event['replay_policy']})
    else:
        writer_policy(event['replay_policy'])
    for v in event['migration'].values():
        guard_rows.enforce('O027', {'site': 'O027', 'code': 'native_migration', 'v0': v})

    def no_secret(value):
        if isinstance(value, str):
            guard_rows.enforce('O028', {'site': 'O028', 'code': 'secret_or_path', 'v0': 'matched' if re.search('^(?:/|[A-Za-z]:[\\\\/]|file://|sk-[A-Za-z0-9]{8,}|Bearer\\s)|://[^/]*@', value) is not None else None})
        elif isinstance(value, dict):
            for v in value.values():
                no_secret(v)
        elif isinstance(value, list):
            for v in value:
                no_secret(v)
    no_secret(event)
    return payload

def original_receipt(event, slot, authority):
    guard_rows.enforce('O029', {'site': 'O029', 'code': 'not_receipted', 'v0': slot['publication']})
    custody = authority['custody'].get(event['event_id'])
    guard_rows.enforce('O030', {'site': 'O030', 'code': 'original_custody_missing', 'v0': custody})
    check_schema('Plans/event_append_receipt_contracts.schema.json', custody, 'custody_v2')
    guard_rows.enforce('O031', {'site': 'O031', 'code': 'receipt_instance', 'v0': custody['storage_instance_id'], 'v1': authority['storage_instance_id']})
    guard_rows.enforce('O032', {'site': 'O032', 'code': 'receipt_identity', 'v0': custody['event_id'], 'v1': event['event_id']})
    guard_rows.enforce('O033', {'site': 'O033', 'code': 'receipt_identity', 'v0': custody['event_type'], 'v1': event['event_type']})
    guard_rows.enforce('O034', {'site': 'O034', 'code': 'receipt_identity', 'v0': custody['idempotency_key'], 'v1': event['idempotency_key']})
    guard_rows.enforce('O035', {'site': 'O035', 'code': 'receipt_scope', 'v0': custody['scope_partition'], 'v1': base64.urlsafe_b64encode(event['project_id'].encode()).decode().rstrip('=')})
    selection_error = None
    try:
        selected = number_custody.resolve(event, custody['first_append_receipt'], authority['storage_instance_id'], slot['source_ref'])
    except numbers.Refusal as exc:
        selection_error = exc.reason
        selected = None
    expected_semantic = number_custody.selected_semantic_digest(selected) if selected is not None else semantic_digest(event)
    guard_rows.enforce('O036', {'site': 'O036', 'code': 'idempotency_conflict', 'v0': custody['producer_semantic_digest'], 'v1': expected_semantic})
    guard_rows.enforce('O037', {'site': 'O037', 'code': 'original_full_value', 'v0': typed_observation(authority['events'].get(event['event_id'])), 'v1': typed_observation(event)})
    guard_rows.enforce('O038', {'site': 'O038', 'code': 'original_commitment', 'v0': typed_observation(custody['original_event_value_commitment']), 'v1': typed_observation(commitment(event))})
    receipt = custody['first_append_receipt']
    guard_rows.enforce('O039', {'site': 'O039', 'code': 'receipt_event_sequence', 'v0': typed_observation(receipt['event_id']), 'v1': typed_observation(event['event_id'])})
    guard_rows.enforce('O040', {'site': 'O040', 'code': 'receipt_event_sequence', 'v0': typed_observation(receipt['sequence_id']), 'v1': typed_observation(event['sequence_id'])})
    guard_rows.enforce('O041', {'site': 'O041', 'code': 'receipt_durability', 'v0': receipt['durability_state']})
    guard_rows.enforce('O042', {'site': 'O042', 'code': 'receipt_durability', 'v0': receipt['durable_end_offset'], 'v1': receipt['byte_offset']})
    for key in ('first_append_receipt', 'original_event_value_commitment', 'original_segment_ref'):
        guard_rows.enforce('O043', {'site': 'O043', 'code': 'original_receipt_equality', 'v0': typed_observation(slot[key]), 'v1': typed_observation(custody[key])})
    group = authority['durable_groups'].get(receipt['commit_group_id'])
    guard_rows.enforce('O044', {'site': 'O044', 'code': 'receipt_group', 'v0': group})
    for k in ('segment_generation', 'segment_name', 'durable_end_offset', 'manifest_generation'):
        guard_rows.enforce('O045', {'site': 'O045', 'code': 'receipt_group', 'v0': typed_observation(group[k]), 'v1': typed_observation(receipt[k])})
    guard_rows.enforce('O046', {'site': 'O046', 'code': 'receipt_group', 'v0': group['group_digest'], 'v1': custody['group_digest']})
    guard_rows.enforce('O047', {'site': 'O047', 'code': 'receipt_group', 'v0': type(group['event_ids']).__name__})
    guard_rows.enforce('O048', {'site': 'O048', 'code': 'receipt_group', 'v0': event['event_id'], 'v1': group['event_ids']})
    guard_rows.enforce('O049', {'site': 'O049', 'code': 'receipt_durability', 'v0': group['durability_class'], 'v1': receipt['durability_class']})
    guard_rows.enforce('O050', {'site': 'O050', 'code': 'receipt_durability', 'v0': receipt['durability_class'], 'v1': group['sync']})
    if selection_error is not None:
        guard_rows.enforce('N001', {'site': 'N001', 'code': selection_error, 'v0': 'refused'})
    else:
        guard_rows.enforce('N001', {'site': 'N001', 'code': 'original_authority', 'v0': None})
        if ORIGINAL_DIGESTS.get() is not None:
            ORIGINAL_DIGESTS.get()[hashlib.sha256(canonical_msgpack(event)).hexdigest()] = expected_semantic

def bundle_source(row, scenario, legacy_validate, historical=False):
    source, authority, event = (scenario['source'], scenario['authority'], scenario['event'])
    check_schema('Plans/dcw/revision_run.schema.json', source, 'inline')
    payload = event_body(row, event, authority)
    fields = ('project_id', 'thread_id', 'bundle_id', 'revision_id', 'annotation_ids', 'requested_revision_capability', 'effective_revision_capability', 'permission_snapshot_id')
    for k in fields:
        guard_rows.enforce('O051', {'site': 'O051', 'code': 'source_identity', 'v0': source[k], 'v1': payload[k]})
    guard_rows.enforce('O052', {'site': 'O052', 'code': 'source_trigger', 'v0': source['trigger']})
    intent = source['intent']
    for k in (*fields, 'trigger'):
        guard_rows.enforce('O053', {'site': 'O053', 'code': 'intent_identity', 'v0': intent[k], 'v1': source[k]})
    guard_rows.enforce('O054', {'site': 'O054', 'code': 'original_intent', 'v0': typed_observation(intent), 'v1': typed_observation(authority['intents'].get(intent['intent_ref']))})
    guard_rows.enforce('O055', {'site': 'O055', 'code': 'original_document', 'v0': typed_observation(authority['documents'].get(intent['source_document_ref'])), 'v1': typed_observation({'version': intent['source_document_version'], 'sha256': intent['source_document_sha256']})})
    guard_rows.enforce('O056', {'site': 'O056', 'code': 'source_key', 'v0': scenario['source_key'], 'v1': source['bundle_id'], 'v2': source['revision_id']})
    previous = None
    settled = set()
    for slot in source['phases']:
        with original_scope(slot is not source['phases'][-1]):
            e = slot['prepared_event']
            name = e['event_type']
            phase_row = dict(row, event_type=name, phase=name.split('_')[-1], schema='Plans/event_payloads/bundle_revision/revision_' + name.split('_')[-1] + '.schema.json')
            p = envelope(phase_row, e, authority=authority)
            if name in ('bundle.revision_completed', 'bundle.revision_interrupted'):
                guard_rows.enforce('O057', {'site': 'O057', 'code': 'exclusive_terminal', 'v0': p['predecessor_event_id'], 'v1': sorted(settled)})
            try:
                legacy_validate(phase_row, p, e, previous)
            except Refusal as exc:
                exc.args = ('phase_order',)
                raise
            except (AssertionError, ValidationError) as exc:
                guard_rows.enforce('OE007', {'site': 'OE007', 'code': 'phase_order', 'v0': 'refused'})
            else:
                guard_rows.enforce('OE007', {'site': 'OE007', 'code': 'phase_order', 'v0': None})
            for k in fields:
                guard_rows.enforce('O058', {'site': 'O058', 'code': 'source_phase_identity', 'v0': p[k], 'v1': source[k]})
            guard_rows.enforce('O059', {'site': 'O059', 'code': 'source_phase_identity', 'v0': typed_observation(slot['phase_sequence']), 'v1': typed_observation(p['phase_sequence'])})
            guard_rows.enforce('O060', {'site': 'O060', 'code': 'source_phase_identity', 'v0': slot['event_type'], 'v1': name})
            guard_rows.enforce('O061', {'site': 'O061', 'code': 'source_phase_identity', 'v0': slot['predecessor_event_id'], 'v1': p['predecessor_event_id']})
            guard_rows.enforce('O062', {'site': 'O062', 'code': 'source_ref', 'v0': slot['source_ref'], 'v1': p['source_ref']})
            guard_rows.enforce('O063', {'site': 'O063', 'code': 'source_ref', 'v0': p['source_ref'], 'v1': compact_digest([p['bundle_id'], p['revision_id'], p['phase_sequence']])})
            result = slot['result']
            kind = dict(requested='accepted_request', started='start_authorized', completed='completed', interrupted='interrupted')[phase_row['phase']]
            guard_rows.enforce('O064', {'site': 'O064', 'code': 'result_kind', 'v0': result['kind'], 'v1': kind})
            guard_rows.enforce('O065', {'site': 'O065', 'code': 'result_kind', 'v0': result['intent_ref'], 'v1': slot['intent_ref']})
            guard_rows.enforce('O066', {'site': 'O066', 'code': 'original_result', 'v0': typed_observation(result), 'v1': typed_observation(authority['results'].get(result['result_ref']))})
            guard_rows.enforce('O067', {'site': 'O067', 'code': 'intent_identity', 'v0': slot['intent_ref'], 'v1': intent['intent_ref']})
            document = authority['documents'].get(result['source_document_ref'])
            guard_rows.enforce('O068', {'site': 'O068', 'code': 'original_document', 'v0': typed_observation(document), 'v1': typed_observation({'version': result['source_document_version'], 'sha256': result['source_document_sha256']})})
            guard_rows.enforce('O069', {'site': 'O069', 'code': 'result_join', 'v0': result['safe_point_id'], 'v1': p['safe_point_id']})
            guard_rows.enforce('O070', {'site': 'O070', 'code': 'result_join', 'v0': result['occurred_at_utc'], 'v1': p['ts']})
            guard_rows.enforce('O071', {'site': 'O071', 'code': 'result_outputs', 'v0': type(authority['outputs']).__name__})
            guard_rows.enforce('O072', {'site': 'O072', 'code': 'result_outputs', 'v0': type(authority['outcomes']).__name__})
            for ref in result['output_document_refs']:
                guard_rows.enforce('O073', {'site': 'O073', 'code': 'result_outputs', 'v0': ref, 'v1': authority['outputs']})
            for ref in result['annotation_outcome_refs']:
                guard_rows.enforce('O074', {'site': 'O074', 'code': 'result_outputs', 'v0': ref, 'v1': authority['outcomes']})
            if kind == 'completed':
                guard_rows.enforce('O075', {'site': 'O075', 'code': 'completion_outputs', 'v0': result['output_document_refs']})
                guard_rows.enforce('O076', {'site': 'O076', 'code': 'completion_outputs', 'v0': result['annotation_outcome_refs']})
            if kind in ('completed', 'interrupted'):
                guard_rows.enforce('O077', {'site': 'O077', 'code': 'exclusive_terminal', 'v0': p['predecessor_event_id'], 'v1': sorted(settled)})
                settled.add(p['predecessor_event_id'])
            if slot is not source['phases'][-1]:
                original_receipt(e, slot, authority)
            previous = dict(p, event_id=e['event_id'])
    matching = [slot for slot in source['phases'] if exact_equal(slot['prepared_event'], event)]
    guard_rows.enforce('O078', {'site': 'O078', 'code': 'latest_source_event', 'v0': matching})
    slot = matching[0]
    if not historical:
        guard_rows.enforce('O079', {'site': 'O079', 'code': 'latest_source_event', 'v0': slot, 'v1': source['phases'][-1]})
        guard_rows.enforce('O080', {'site': 'O080', 'code': 'source_status', 'v0': source['status'], 'v1': dict(requested='pending', started='running', completed='completed', interrupted='failed')[row['phase']]})
    guard_rows.enforce('O081', {'site': 'O081', 'code': 'source_actor', 'v0': event['actor_ref'], 'v1': authority['original_actor_ref']})
    return slot

def wizard_source(row, scenario):
    source, authority, event = (scenario['source'], scenario['authority'], scenario['event'])
    check_schema(row['source_schema'], source, 'inline')
    event_body(row, source['prepared_event'], authority)
    p = event_body(row, event, authority)
    req = source['request']
    child = source['child']
    seed = source['seed']
    result = source['result']
    guard_rows.enforce('O082', {'site': 'O082', 'code': 'source_key', 'v0': scenario['source_key'], 'v1': row['source_family'], 'v2': p['project_id'], 'v3': p['planning_run_id'], 'v4': p['request_id']})
    guard_rows.enforce('O083', {'site': 'O083', 'code': 'source_ref', 'v0': source['source_ref'], 'v1': p['source_ref']})
    guard_rows.enforce('O084', {'site': 'O084', 'code': 'source_ref', 'v0': p['source_ref'], 'v1': row['source_family'], 'v2': event['idempotency_key'].split(':')[-1]})
    for key in ('project_id', 'planning_run_id', 'named_plan_id', 'thread_group_id', 'thread_id'):
        guard_rows.enforce('O085', {'site': 'O085', 'code': 'current_child_join', 'v0': p[key], 'v1': req[key]})
        guard_rows.enforce('O086', {'site': 'O086', 'code': 'current_child_join', 'v0': req[key], 'v1': child[key]})
    guard_rows.enforce('O087', {'site': 'O087', 'code': 'original_request', 'v0': typed_observation(req), 'v1': typed_observation(authority['requests'].get(req['request_ref']))})
    guard_rows.enforce('O088', {'site': 'O088', 'code': 'original_child', 'v0': typed_observation(child), 'v1': typed_observation(authority['children'].get(result['child_ref']))})
    guard_rows.enforce('O089', {'site': 'O089', 'code': 'original_result', 'v0': typed_observation(result), 'v1': typed_observation(authority['results'].get(result['result_ref']))})
    guard_rows.enforce('O090', {'site': 'O090', 'code': 'result_join', 'v0': p['result_ref'], 'v1': result['result_ref']})
    guard_rows.enforce('O091', {'site': 'O091', 'code': 'result_join', 'v0': result['request_ref'], 'v1': req['request_ref']})
    guard_rows.enforce('O092', {'site': 'O092', 'code': 'request_identity', 'v0': p['permission_snapshot_id'], 'v1': req['permission_snapshot_id']})
    guard_rows.enforce('O093', {'site': 'O093', 'code': 'request_identity', 'v0': req['request_id'], 'v1': p['request_id']})
    guard_rows.enforce('O094', {'site': 'O094', 'code': 'source_actor', 'v0': event['actor_ref'], 'v1': req['actor_ref']})
    guard_rows.enforce('O095', {'site': 'O095', 'code': 'source_actor', 'v0': req['actor_ref'], 'v1': authority['original_actor_ref']})
    guard_rows.enforce('O096', {'site': 'O096', 'code': 'child_currentness', 'v0': typed_observation(req['expected_child_revision']), 'v1': typed_observation(result['child_revision'])})
    guard_rows.enforce('O097', {'site': 'O097', 'code': 'child_currentness', 'v0': typed_observation(result['child_revision']), 'v1': typed_observation(child['revision'])})
    guard_rows.enforce('O098', {'site': 'O098', 'code': 'child_currentness', 'v0': req['expected_child_sha256'], 'v1': result['child_sha256']})
    guard_rows.enforce('O099', {'site': 'O099', 'code': 'child_currentness', 'v0': result['child_sha256'], 'v1': child['sha256']})
    guard_rows.enforce('O100', {'site': 'O100', 'code': 'original_seed', 'v0': typed_observation(seed), 'v1': typed_observation(authority['seeds'].get(seed['seed_ref']))})
    for dst, src in [('seed_ref', 'seed_ref'), ('seed_kind', 'seed_kind'), ('seed_version', 'version'), ('seed_sha256', 'sha256'), ('named_plan_id', 'named_plan_id'), ('project_context_snapshot_ref', 'project_context_snapshot_ref'), ('project_context_snapshot_hash', 'project_context_snapshot_hash')]:
        guard_rows.enforce('O101', {'site': 'O101', 'code': 'seed_join', 'v0': p[dst], 'v1': seed[src]})
    guard_rows.enforce('O102', {'site': 'O102', 'code': 'seed_result', 'v0': result['seed_ref'], 'v1': seed['seed_ref']})
    guard_rows.enforce('O103', {'site': 'O103', 'code': 'seed_result', 'v0': result['seed_sha256'], 'v1': seed['sha256']})
    guard_rows.enforce('O104', {'site': 'O104', 'code': 'seed_result', 'v0': result['project_context_snapshot_ref'], 'v1': seed['project_context_snapshot_ref']})
    guard_rows.enforce('O105', {'site': 'O105', 'code': 'seed_result', 'v0': result['project_context_snapshot_hash'], 'v1': seed['project_context_snapshot_hash']})
    guard_rows.enforce('O106', {'site': 'O106', 'code': 'context_currentness', 'v0': authority['contexts'].get(seed['project_context_snapshot_ref']), 'v1': seed['project_context_snapshot_hash']})
    guard_rows.enforce('O107', {'site': 'O107', 'code': 'original_time', 'v0': p['ts'], 'v1': result['occurred_at_utc']})
    if row['event_type'] == 'wizard.opened':
        guard_rows.enforce('O108', {'site': 'O108', 'code': 'open_boundary', 'v0': result['status']})
        guard_rows.enforce('O109', {'site': 'O109', 'code': 'open_boundary', 'v0': p['predecessor_event_id']})
    else:
        guard_rows.enforce('O110', {'site': 'O110', 'code': 'load_boundary', 'v0': result['status']})
        opened = authority['events'].get(p['predecessor_event_id'])
        guard_rows.enforce('O111', {'site': 'O111', 'code': 'opened_original', 'v0': opened})
        guard_rows.enforce('O112', {'site': 'O112', 'code': 'opened_original', 'v0': opened['event_type']})
        opened_row = dict(row, event_type='wizard.opened', schema='Plans/event_payloads/planning_wizard/wizard_opened.schema.json')
        opened_payload = envelope(opened_row, opened, authority=authority)
        for key in ('project_id', 'planning_run_id', 'named_plan_id', 'thread_group_id', 'thread_id', 'request_id', 'seed_ref', 'seed_kind', 'seed_version', 'seed_sha256', 'project_context_snapshot_ref', 'project_context_snapshot_hash'):
            guard_rows.enforce('O113', {'site': 'O113', 'code': 'opened_join', 'v0': opened_payload[key], 'v1': p[key]})
        opened_source_custody(opened_row, scenario, opened, opened_payload)
    guard_rows.enforce('O114', {'site': 'O114', 'code': 'latest_source_event', 'v0': typed_observation(source['prepared_event']), 'v1': typed_observation(event)})
    return source

def index_read(index, reader, authority=None, event_validator=None):
    checkpoint = index['checkpoint']
    generation = checkpoint['generations'][checkpoint['current_generation_id']]
    frontier = generation['frontier']
    check_schema('Plans/event_record_index_checkpoint.schema.json', checkpoint, 'checkpoint')
    check_schema('Plans/event_record_index_checkpoint.schema.json', reader['live_token'], 'read_token')
    guard_rows.enforce('O115', {'site': 'O115', 'code': 'index_currentness', 'v0': generation['state']})
    guard_rows.enforce('O116', {'site': 'O116', 'code': 'index_currentness', 'v0': frontier['source_selection'], 'v1': index['current_source']['source_selection']})
    guard_rows.enforce('O117', {'site': 'O117', 'code': 'index_coverage', 'v0': frontier['coverage']['complete_to_captured_boundary']})
    rows = index['datasets'][generation['index_dataset_name']]
    guard_rows.enforce('O118', {'site': 'O118', 'code': 'index_coverage', 'v0': rows, 'v1': frontier['index_row_count']})
    guard_rows.enforce('O119', {'site': 'O119', 'code': 'index_coverage', 'v0': frontier['index_row_count'], 'v1': frontier['coverage']['retained_event_count']})
    guard_rows.enforce('O120', {'site': 'O120', 'code': 'index_CAS', 'v0': reader['expected_predecessor'], 'v1': frontier['predecessor_frontier_sha256']})
    guard_rows.enforce('O121', {'site': 'O121', 'code': 'index_atomicity', 'v0': index['committed_transactions'], 'v1': frontier['redb_transaction_id'], 'v2': generation['generation_id'], 'v3': frontier['index_row_set_sha256']})
    guard_rows.enforce('O122', {'site': 'O122', 'code': 'durable_snapshot_forbidden', 'v0': reader['durable_token']})
    guard_rows.enforce('O123', {'site': 'O123', 'code': 'durable_token', 'v0': typed_observation(reader['durable_token']), 'v1': typed_observation({k: v for k, v in reader['live_token'].items() if k != 'redb_snapshot_id'})})
    guard_rows.enforce('O124', {'site': 'O124', 'code': 'token_shape', 'v0': reader['durable_token']})
    guard_rows.enforce('O125', {'site': 'O125', 'code': 'token_shape', 'v0': reader['live_token']})
    token = reader['live_token']
    guard_rows.enforce('O126', {'site': 'O126', 'code': 'index_currentness', 'v0': token['generation_anchor_sha256'], 'v1': index_binding(generation['anchor'])})
    guard_rows.enforce('O127', {'site': 'O127', 'code': 'index_currentness', 'v0': token['generation_id'], 'v1': generation['generation_id']})
    guard_rows.enforce('O128', {'site': 'O128', 'code': 'index_currentness', 'v0': token['storage_instance_id'], 'v1': checkpoint['storage_instance_id']})
    guard_rows.enforce('O129', {'site': 'O129', 'code': 'index_currentness', 'v0': token['source_selection'], 'v1': frontier['source_selection']})
    guard_rows.enforce('O130', {'site': 'O130', 'code': 'index_currentness', 'v0': token['frontier_revision'], 'v1': frontier['publication_revision']})
    guard_rows.enforce('O131', {'site': 'O131', 'code': 'index_currentness', 'v0': token['index_dataset_name'], 'v1': generation['index_dataset_name']})
    guard_rows.enforce('O132', {'site': 'O132', 'code': 'index_currentness', 'v0': token['checkpoint_key'], 'v1': index['checkpoint_key']})
    guard_rows.enforce('O133', {'site': 'O133', 'code': 'index_currentness', 'v0': index['checkpoint_key'], 'v1': checkpoint['storage_instance_id']})
    guard_rows.enforce('O134', {'site': 'O134', 'code': 'index_currentness', 'v0': token['checkpoint_ref'], 'v1': index['checkpoint_key'], 'v2': generation['generation_id']})
    guard_rows.enforce('O135', {'site': 'O135', 'code': 'index_currentness', 'v0': token['redb_snapshot_id'], 'v1': index['captured_redb_snapshot_id']})
    guard_rows.enforce('O136', {'site': 'O136', 'code': 'index_currentness', 'v0': index['committed_transactions'], 'v1': frontier['redb_transaction_id'], 'v2': token['frontier_sha256']})
    index_content(index, reader, authority, event_validator)

def source_storage(row, scenario):
    """Validate the physical redb row and its SP-337 original payload, if selected.

    `source` is the independently decoded logical original. Synthetic payload
    authority is an adapter input, never native durability/authentication proof.
    """
    source = scenario['source']
    stored = scenario.get('stored_source', source)
    profile = load('Plans/storage_value_registry.json')['storage_profile']['family_profiles'][row['source_family']]
    guard_rows.enforce('O137', {'site': 'O137', 'code': 'source_storage_profile', 'v0': profile['redb_file']})
    guard_rows.enforce('O138', {'site': 'O138', 'code': 'source_storage_profile', 'v0': profile['storage_group']})
    guard_rows.enforce('O139', {'site': 'O139', 'code': 'source_storage_profile', 'v0': typed_observation(profile['max_value_bytes']), 'v1': typed_observation(16384)})
    guard_rows.enforce('O140', {'site': 'O140', 'code': 'refuse_oversized_source', 'v0': canonical_msgpack(stored), 'v1': profile['max_value_bytes']})
    check_schema(row['source_schema'], stored)
    if 'source_payload_ref' not in stored:
        guard_rows.enforce('O141', {'site': 'O141', 'code': 'source_storage_value', 'v0': typed_observation(stored), 'v1': typed_observation(source)})
        return
    guard_rows.enforce('O142', {'site': 'O142', 'code': 'source_reference_identity', 'v0': stored['source_key'], 'v1': scenario['source_key']})
    for k in ('schema_id', 'schema_version', 'storage_instance_id', 'recovery_epoch', 'value_revision'):
        guard_rows.enforce('O143', {'site': 'O143', 'code': 'source_reference_identity', 'v0': typed_observation(stored[k]), 'v1': typed_observation(source[k])})
    ref = stored['source_payload_ref']
    payload = scenario['authority'].get('payloads', {}).get(ref['blake3'])
    guard_rows.enforce('O144', {'site': 'O144', 'code': 'source_payload_missing', 'v0': payload})
    guard_rows.enforce('O145', {'site': 'O145', 'code': 'source_payload_unavailable', 'v0': payload['readable']})
    guard_rows.enforce('O146', {'site': 'O146', 'code': 'source_payload_not_durable', 'v0': payload['durable']})
    guard_rows.enforce('O147', {'site': 'O147', 'code': 'source_payload_not_durable', 'v0': payload['index_durable']})
    raw = canonical_msgpack(payload['body'])
    guard_rows.enforce('O148', {'site': 'O148', 'code': 'source_payload_size', 'v0': raw, 'v1': ref['byte_size']})
    guard_rows.enforce('O149', {'site': 'O149', 'code': 'source_payload_digest', 'v0': blake3(raw).hexdigest(), 'v1': ref['blake3']})
    check_schema(row['source_schema'], payload['body'], 'inline')
    guard_rows.enforce('O150', {'site': 'O150', 'code': 'source_payload_substitution', 'v0': raw, 'v1': canonical_msgpack(source)})

@historical_boundary
def verify(row, scenario, operation, legacy_validate):
    event = scenario['event']
    authority = scenario['authority']
    control = scenario['control']
    if operation == 'compatibility_append':
        envelope(row, event, authority=authority)
    payload = envelope(row, event, compatibility=operation == 'compatibility_read', authority=authority)
    guard_rows.enforce('O151', {'site': 'O151', 'code': 'family_not_admitted', 'v0': type(control['admitted_families']).__name__})
    guard_rows.enforce('O152', {'site': 'O152', 'code': 'family_not_admitted', 'v0': row['event_type'], 'v1': control['admitted_families']})
    guard_rows.enforce('O153', {'site': 'O153', 'code': 'storage_instance', 'v0': control['selected_storage_instance_id'], 'v1': authority['storage_instance_id']})
    guard_rows.enforce('O154', {'site': 'O154', 'code': 'storage_instance', 'v0': authority['storage_instance_id'], 'v1': scenario['source']['storage_instance_id']})
    guard_rows.enforce('O155', {'site': 'O155', 'code': 'restore_epoch', 'v0': type(control['selected_recovery_epoch']).__name__})
    guard_rows.enforce('O156', {'site': 'O156', 'code': 'restore_epoch', 'v0': typed_observation(control['selected_recovery_epoch']), 'v1': typed_observation(authority['recovery_epoch'])})
    if control['selected_recovery_epoch'] != scenario['source']['recovery_epoch']:
        admission = authority.get('restore_admission')
        guard_rows.enforce('O157', {'site': 'O157', 'code': 'restore_epoch', 'v0': admission})
        guard_rows.enforce('O158', {'site': 'O158', 'code': 'restore_epoch', 'v0': scenario['source']['recovery_epoch'], 'v1': control['selected_recovery_epoch']})
        check_schema('Plans/event_append_receipt_contracts.schema.json', admission, 'restore_admission')
        guard_rows.enforce('O159', {'site': 'O159', 'code': 'restore_admission', 'v0': typed_observation(admission['recovery_epoch']), 'v1': typed_observation(control['selected_recovery_epoch'])})
        guard_rows.enforce('O160', {'site': 'O160', 'code': 'restore_admission', 'v0': admission['storage_instance_id'], 'v1': authority['storage_instance_id']})
        guard_rows.enforce('O161', {'site': 'O161', 'code': 'restore_admission', 'v0': admission['restored_boundary_sha256'], 'v1': control['restored_boundary_sha256']})
        source_sha = hashlib.sha256(canonical_msgpack(scenario.get('stored_source', scenario['source']))).hexdigest()
        guard_rows.enforce('O162', {'site': 'O162', 'code': 'restore_source_inventory', 'v0': authority.get('restored_sources', {}).get(compact_digest(scenario['source_key'])), 'v1': source_sha})
        stored = scenario.get('stored_source', scenario['source'])
        if 'source_payload_ref' in stored:
            ref = stored['source_payload_ref']
            guard_rows.enforce('O163', {'site': 'O163', 'code': 'restore_payload_inventory', 'v0': typed_observation(authority.get('restored_payloads', {}).get(ref['blake3'])), 'v1': typed_observation({k: ref[k] for k in ('byte_size', 'media_type')})})
        ids = {slot['prepared_event']['event_id'] for slot in scenario['source']['phases']} if row['event_type'].startswith('bundle.') else {event['event_id']}
        if row['event_type'] == 'wizard.deferred_payload.loaded':
            ids.add(payload['predecessor_event_id'])
        for event_id in ids:
            original = authority['events'].get(event_id)
            if original is not None and original['payload_ref'] is not None:
                original_row = dict(row, schema=next((r['schema'] for r in load('Plans/dcw_event_contract_fixtures.json')['families'] if r['event_type'] == original['event_type'])))
                ref = event_reference(original_row, original)
                guard_rows.enforce('O164', {'site': 'O164', 'code': 'restore_event_payload_inventory', 'v0': typed_observation(authority.get('restored_event_payloads', {}).get(ref['blake3'])), 'v1': typed_observation({k: ref[k] for k in ('byte_size', 'media_type')})})
        guard_rows.enforce('O165', {'site': 'O165', 'code': 'restore_members', 'v0': sorted(ids), 'v1': admission['members']})
        for member in admission['members']:
            c = authority['custody'].get(member['event_id'])
            guard_rows.enforce('O166', {'site': 'O166', 'code': 'restore_members', 'v0': c})
            for k in ('event_id', 'scope_partition', 'event_type', 'idempotency_key', 'producer_semantic_digest'):
                guard_rows.enforce('O167', {'site': 'O167', 'code': 'restore_members', 'v0': member[k], 'v1': c[k]})
    guard_rows.enforce('O168', {'site': 'O168', 'code': 'restore_boundary', 'v0': control['restored_boundary_sha256'], 'v1': authority['restored_boundary_sha256']})
    if operation in ('append', 'publish', 'retry'):
        guard_rows.enforce('O169', {'site': 'O169', 'code': 'source_CAS', 'v0': typed_observation(control['expected_value_revision']), 'v1': typed_observation(scenario['source']['value_revision'])})
        guard_rows.enforce('O170', {'site': 'O170', 'code': 'effect_unknown', 'v0': control['effect_state']})
    guard_rows.enforce('O171', {'site': 'O171', 'code': 'permission_or_deleted_source', 'v0': type(authority['readable_projects']).__name__})
    guard_rows.enforce('O172', {'site': 'O172', 'code': 'permission_or_deleted_source', 'v0': payload['project_id'], 'v1': authority['readable_projects']})
    guard_rows.enforce('O173', {'site': 'O173', 'code': 'permission_or_deleted_source', 'v0': type(authority['permission_snapshots']).__name__})
    guard_rows.enforce('O174', {'site': 'O174', 'code': 'permission_or_deleted_source', 'v0': payload['permission_snapshot_id'], 'v1': authority['permission_snapshots']})
    if operation in ('append', 'publish', 'retry'):
        guard_rows.enforce('O175', {'site': 'O175', 'code': 'permission_or_deleted_source', 'v0': type(authority['writable_projects']).__name__})
        guard_rows.enforce('O176', {'site': 'O176', 'code': 'permission_or_deleted_source', 'v0': payload['project_id'], 'v1': authority['writable_projects']})
        guard_rows.enforce('O177', {'site': 'O177', 'code': 'writer_cutoff', 'v0': control['writer_cutoff'], 'v1': operation, 'v2': control['pending_disposition']})
    if operation == 'retry':
        if 'retry_request' in scenario:
            admit_retry_request(row, scenario['retry_request'])
            if 'replay_policy' in scenario['retry_request']:
                writer_policy(scenario['retry_request']['replay_policy'])
            original_slot = scenario['source']['phases'][-1] if row['event_type'].startswith('bundle.') else scenario['source']
            guard_rows.enforce('O178', {'site': 'O178', 'code': 'idempotency_conflict', 'v0': semantic_digest(scenario['retry_request']), 'v1': original_semantic_digest(event, authority, original_slot)})
        original_receipt(event, scenario['source']['phases'][-1] if row['event_type'].startswith('bundle.') else scenario['source'], authority)
    if operation in ('read', 'rebuild', 'compatibility_read'):
        guard_rows.enforce('O179', {'site': 'O179', 'code': 'reader_withdrawn', 'v0': control['reader_withdrawn']})
        guard_rows.enforce('O180', {'site': 'O180', 'code': 'unsupported_reader', 'v0': control['reader_schema_version'], 'v1': payload['schema_version']})
        if operation == 'rebuild':
            guard_rows.enforce('O181', {'site': 'O181', 'code': 'rebuild_not_current', 'v0': control['replacement_reader_admitted']})
            guard_rows.enforce('O182', {'site': 'O182', 'code': 'rebuild_not_current', 'v0': control['rebuild_complete']})
        index = copy.deepcopy(scenario['index'])
        for mutation in scenario.get('index_mutations', []):
            patch(index, mutation)
        guard_rows.enforce('O183', {'site': 'O183', 'code': 'checkpoint_storage_instance', 'v0': scenario['reader']['live_token']['storage_instance_id'], 'v1': authority['storage_instance_id']})
    original_event = authority['events'].get(event['event_id'])
    if operation == 'compatibility_read':
        guard_rows.enforce('O184', {'site': 'O184', 'code': 'original_custody_missing', 'v0': original_event})
        supplied_original = dict(event, replay_policy=original_event['replay_policy'])
        guard_rows.enforce('O185', {'site': 'O185', 'code': 'original_full_value', 'v0': typed_observation(supplied_original), 'v1': typed_observation(original_event)})
        scenario = copy.deepcopy(scenario)
        scenario['event'] = original_event
        event = original_event
    source_storage(row, scenario)
    secret_free(scenario['source'])
    slot = bundle_source(row, scenario, legacy_validate, historical=operation in ('read', 'rebuild', 'compatibility_read')) if row['event_type'].startswith('bundle.') else wizard_source(row, scenario)
    if operation != 'append':
        original_receipt(event, slot, authority)
    if operation in ('read', 'rebuild', 'compatibility_read'):
        index_read(index, scenario['reader'], authority)
        index_event(index, event, authority)
    guard_rows.enforce('O186', {'site': 'O186', 'code': 'reader_effect_forbidden' if operation in ('read', 'rebuild', 'compatibility_read') else 'effect_not_authorized', 'v0': control['requested_effects']})
    if operation in ('append', 'publish'):
        semantic_digest(event)
    return 'accept'

def patch(value, mutation):
    if mutation.get('op') == 'copy':
        source = value
        for part in mutation['from'].strip('/').split('/'):
            source = source[int(part)] if isinstance(source, list) else source[part]
        mutation = dict(mutation, op='replace', value=copy.deepcopy(source))
    parts = mutation['path'].strip('/').split('/')
    target = value
    for key in parts[:-1]:
        target = target[int(key)] if isinstance(target, list) else target[key]
    key = int(parts[-1]) if isinstance(target, list) else parts[-1]
    if mutation.get('op') == 'remove':
        del target[key]
    elif mutation.get('op') == 'append':
        target[key].append(copy.deepcopy(mutation['value']))
    else:
        target[key] = copy.deepcopy(mutation['value'])

def source_size_fixture(row, scenario, target, referenced, payload_body_mutations=()):
    """Build exact canonical-byte boundary inputs using bounded evidence refs."""
    source = scenario['source']
    refs = source['changes'] if row['event_type'].startswith('bundle.') else source['seed']['warning_refs']
    refs.clear()
    while target - len(canonical_msgpack(source)) > 520:
        refs.append('evidence:' + str(len(refs)) + ':' + 'a' * 480)
    refs.append('evidence:boundary:')
    for length in range(1, 513):
        refs[-1] = ('evidence:boundary:' + 'b' * 512)[:length]
        if len(canonical_msgpack(source)) == target:
            break
    else:
        raise AssertionError(('unreachable source boundary', row['event_type'], target))
    if row['event_type'].startswith('wizard.'):
        scenario['authority']['seeds'][source['seed']['seed_ref']] = copy.deepcopy(source['seed'])
        if row['event_type'] == 'wizard.deferred_payload.loaded':
            scenario['authority']['opened_source']['seed'] = copy.deepcopy(source['seed'])
            from pm_dcw_event_fixtures import opened_source_reference
            opened_source_reference(scenario)
    if referenced:
        body = copy.deepcopy(source)
        for mutation in payload_body_mutations:
            patch(body, mutation)
        raw = canonical_msgpack(body)
        payload_id = blake3(raw).hexdigest()
        scenario['stored_source'] = {k: source[k] for k in ('schema_id', 'schema_version', 'storage_instance_id', 'recovery_epoch', 'value_revision')}
        scenario['stored_source'].update(source_key=copy.deepcopy(scenario['source_key']), source_payload_ref=dict(blake3=payload_id, byte_size=len(raw), media_type='application/vnd.puppetmaster.' + row['source_family'].replace('_', '-') + '+msgpack'))
        scenario['authority'].setdefault('payloads', {})[payload_id] = dict(body=body, readable=True, durable=True, index_durable=True)
    if source['recovery_epoch'] != scenario['control']['selected_recovery_epoch']:
        stored = scenario.get('stored_source', source)
        scenario['authority']['restored_sources'][compact_digest(scenario['source_key'])] = hashlib.sha256(canonical_msgpack(stored)).hexdigest()
        if referenced:
            ref = stored['source_payload_ref']
            scenario['authority']['restored_payloads'] = {ref['blake3']: {k: ref[k] for k in ('byte_size', 'media_type')}}
        from pm_dcw_event_fixtures import refresh_restore
        refresh_restore(scenario)

def run(legacy_validate, family=None):
    from pm_dcw_event_numeric_cases import cases as numeric_cases
    fixtures = load('Plans/dcw_event_contract_fixtures.json')
    checks = 0
    guard_rows.enforce('O187', {'site': 'O187', 'code': 'family_inventory', 'v0': [r['event_type'] for r in fixtures['families']]})
    guard_rows.enforce('O188', {'site': 'O188', 'code': 'family_inventory', 'v0': [r['event_type'] for r in fixtures['families']]})
    guard_rows.enforce('O189', {'site': 'O189', 'code': 'family_inventory', 'v0': family, 'v1': [r['event_type'] for r in fixtures['families']]})
    for schema_path in SCHEMAS:
        schema = load(str(schema_path.relative_to(ROOT)))
        Draft202012Validator.check_schema(schema)
        schema_references(schema)
    registry = load('Plans/storage_value_registry.json')
    for row in (r for r in fixtures['families'] if family is None or r['event_type'] == family):
        source = next((f for f in registry['families'] if f['family_id'] == row['source_family']))
        guard_rows.enforce('O190', {'site': 'O190', 'code': 'materialized_source', 'v0': source['status']})
        guard_rows.enforce('O191', {'site': 'O191', 'code': 'materialized_source', 'v0': source['value_schema_ref'], 'v1': row['source_schema']})
        guard_rows.enforce('O192', {'site': 'O192', 'code': 'materialized_source', 'v0': schema_observation(source['value_schema']), 'v1': schema_observation(load(row['source_schema']))})
        guard_rows.enforce('O193', {'site': 'O193', 'code': 'original_backup_contract', 'v0': source['recovery_disposition']['backup_required']})
        guard_rows.enforce('O194', {'site': 'O194', 'code': 'original_backup_contract', 'v0': source['restore_disposition']['mutation_fence_on_unresolved']})
        guard_rows.enforce('O195', {'site': 'O195', 'code': 'original_backup_contract', 'v0': source['restore_disposition']['mode']})
        for case in [*row['cases'], *numeric_cases(row)]:
            scenario = copy.deepcopy(case.get('_value', row['positive']))
            if 'base_case' in case:
                base = next((c for c in row['cases'] if c['case_id'] == case['base_case']))
                for mutation in base.get('mutations', ()):
                    patch(scenario, mutation)
            if 'event_bytes' in case:
                from pm_dcw_event_fixtures import event_case_fixture
                event_case_fixture(row, scenario, case)
            if 'source_bytes' in case:
                source_size_fixture(row, scenario, case['source_bytes'], case['source_representation'] == 'payload_reference', case.get('payload_body_mutations', ()))
            for mutation in case.get('mutations', []):
                patch(scenario, mutation)
            if case.get('refresh_index'):
                from pm_dcw_index_fixtures import issue
                issue(scenario)
            try:
                outcome = verify(row, scenario, case['operation'], legacy_validate)
            except Refusal as exc:
                outcome = str(exc)
            assert outcome == case['expected'], (row['event_type'], case['case_id'], case['expected'], outcome)
            checks += 1
            if outcome == 'accept' and case['operation'] in ('append', 'publish', 'retry'):
                if case['operation'] == 'retry':
                    retry_scenario = copy.deepcopy(scenario)
                    retry_scenario.setdefault('retry_request', copy.deepcopy(scenario['event']))
                    retry_scenario['retry_request']['replay_policy'] = 'projector_replay_only'
                    try:
                        verify(row, retry_scenario, 'retry', legacy_validate)
                    except Refusal as exc:
                        assert str(exc) == 'replay_only_not_appendable', (row['event_type'], case['case_id'], str(exc))
                    else:
                        raise AssertionError('reader-only caller retry accepted: ' + case['case_id'])
                    checks += 1
                from pm_dcw_event_fixtures import writer_policy_fixture
                writer_policy_fixture(row, scenario)
                try:
                    verify(row, scenario, case['operation'], legacy_validate)
                except Refusal as exc:
                    assert str(exc) == 'replay_only_not_appendable', (row['event_type'], case['case_id'], str(exc))
                else:
                    raise AssertionError('reader-only policy accepted on current writer: ' + case['case_id'])
                checks += 1
        for field in row['positive']['event']['payload']:
            scenario = copy.deepcopy(row['positive'])
            del scenario['event']['payload'][field]
            try:
                verify(row, scenario, 'publish', legacy_validate)
            except Refusal as exc:
                assert str(exc) == 'schema'
            else:
                raise AssertionError('missing payload field accepted: ' + field)
            checks += 1
        for field in row['positive']['event']:
            scenario = copy.deepcopy(row['positive'])
            del scenario['event'][field]
            try:
                verify(row, scenario, 'publish', legacy_validate)
            except Refusal as exc:
                assert str(exc) == 'schema'
            else:
                raise AssertionError('missing full-envelope field accepted: ' + field)
            checks += 1
        print(row['event_type'] + ': PASS (full static envelope/source/receipt/transition/withdrawal composition)')
    assert all((x['execution_status'] == 'NOT_RUN' for x in fixtures['native_oracles']))
    print(json.dumps({'status': 'PASS', 'full_contract_cases': checks, 'native': 'NOT_RUN', 'admission': 'ABSENT'}))
    return checks

def integer_format(value):
    if value is None:
        return True
    try:
        numbers.current_integer(value)
        return True
    except numbers.Refusal:
        return False
FORMAT.checks('pm-uint')(integer_format)

def canonical_json(value, sort_keys=False):

    def domain(item):
        guard_rows.enforce('O196', {'site': 'O196', 'code': 'integer_json_domain', 'v0': type(item).__name__, 'v1': type(None).__name__})
        if type(item) is dict:
            for key, child in item.items():
                domain(key)
                domain(child)
        elif type(item) is list:
            for child in item:
                domain(child)
    domain(value)

    def encode(item):
        if type(item) is int:
            from decimal import Decimal
            return format(Decimal(item), 'f')
        if type(item) is list:
            return '[' + ','.join((encode(v) for v in item)) + ']'
        if type(item) is dict:
            keys = sorted(item) if sort_keys else item
            return '{' + ','.join((encode(k) + ':' + encode(item[k]) for k in keys)) + '}'
        return json.dumps(item, ensure_ascii=False, separators=(',', ':'), allow_nan=False)
    return encode(value).encode('utf-8')

def exact_equal(left, right):
    """Authenticate exact types and bytes, including all nested original fields."""

    def same_types(a, b):
        if type(a) is not type(b):
            return False
        if type(a) is dict:
            return a.keys() == b.keys() and all((same_types(a[k], b[k]) for k in a))
        if type(a) is list:
            return len(a) == len(b) and all((same_types(a, b) for a, b in zip(a, b)))
        return True
    if not same_types(left, right):
        return False
    try:
        return canonical_msgpack(left) == canonical_msgpack(right)
    except Refusal:
        return False

def opened_source_custody(row, scenario, opened, payload):
    """Resolve the separately owned predecessor through the full historical path.

    Its physical source, immutable owner observations, full event and receipt
    must authenticate independently of the loaded event. Current writer CAS,
    effects, cutoff and write permission never apply to this retained original.
    """
    authority = scenario['authority']
    source = authority.get('opened_source')
    guard_rows.enforce('O197', {'site': 'O197', 'code': 'opened_source_missing', 'v0': type(source).__name__})
    check_schema('Plans/dcw/wizard_open_evidence.schema.json', source, 'inline')
    predecessor = dict(scenario, event=opened, source=source, source_key=authority.get('opened_source_key', ['wizard_open_evidence.v1', payload['project_id'], payload['planning_run_id'], payload['request_id']]), stored_source=authority.get('opened_stored_source', source), control=dict(scenario['control'], reader_withdrawn=authority.get('opened_reader_withdrawn'), requested_effects=[]))
    opened_row = dict(row, source_family='wizard_open_evidence', source_schema='Plans/dcw/wizard_open_evidence.schema.json')
    verify(opened_row, predecessor, 'read', None)

def valid_date_time(value):
    """RFC3339 shape and calendar checks, independent of optional packages.

    Fractions have one or more decimal digits; numeric zones and t/z follow
    RFC3339. Family UTC-Z constraints remain in their schemas. Seconds are
    00..59, matching the existing Python calendar validator (no leap seconds).
    These prepared families have no admitted older timestamp recipe.
    """
    from datetime import datetime
    if not isinstance(value, str):
        return True
    match = re.fullmatch('([0-9]{4})-([0-9]{2})-([0-9]{2})[Tt]([0-9]{2}):([0-9]{2}):([0-9]{2})(?:\\.[0-9]+)?(?:[Zz]|([+-])([0-9]{2}):([0-9]{2}))', value)
    if match is None:
        return False
    try:
        datetime(*(int(match[i]) for i in range(1, 7)))
        return match[8] is None or (int(match[8]) <= 23 and int(match[9]) <= 59)
    except ValueError:
        return False
FORMAT.checks('date-time')(valid_date_time)

def index_binding(value):
    try:
        raw = numbers.storage_value_bytes({'domain': 'pm.event_index.binding.msgpack_sha256.v1', 'value': value}, profile=numbers.INDEX_BINDING)
    except numbers.Refusal as exc:
        guard_rows.enforce('N004', {'site':'N004','code':exc.reason,'v0':'refused'})
    else:
        guard_rows.enforce('N004', {'site':'N004','code':'binding_domain','v0':None})
    return hashlib.sha256(raw).hexdigest()

def index_partition(event):
    return 'app' if event['scope_kind'] == 'application' else 'project~' + base64.urlsafe_b64encode(event['project_id'].encode('utf-8')).decode('ascii').rstrip('=')

def index_key(event):
    return 'event_record_index.v2:' + index_partition(event) + ':' + str(event['sequence_id']).zfill(20) + ':' + event['event_id']

def index_prefix(frames):
    return index_binding(dict(domain='pm.event_index.retained_prefix.v1', entries=[dict(sequence_id=f['event']['sequence_id'], event_id=f['event']['event_id'], scope_partition=index_partition(f['event']), source_value_bytes_sha256=hashlib.sha256(source_frame_bytes(f['source_value_bytes_base64'])).hexdigest()) for f in frames]))

def index_selection(source, storage_instance_id):
    manifest = source['manifest']
    return dict(storage_instance_id=storage_instance_id, current_ref='storage/seglog/CURRENT', current_bytes_sha256=hashlib.sha256(canonical_msgpack(source['current'])).hexdigest(), selected_segment_generation=source['current']['selected_segment_generation'], manifest_ref='storage/seglog/manifest.v1.msgpack', manifest_bytes_sha256=hashlib.sha256(canonical_msgpack(manifest)).hexdigest(), manifest_generation=manifest['manifest_generation'], recovery_epoch=manifest['recovery_epoch'], manifest_survivor_prefix_sha256=index_prefix(source['frames']), **{field + '_sha256': index_binding(manifest[field]) for field in ('retained_inventory', 'durable_watermarks', 'excluded_ranges', 'retired_inputs')})

def index_coverage(source):
    frames = source['frames']
    last = frames[-1] if frames else None
    return dict(scope='all_application_and_project_partitions', complete_to_captured_boundary=True, empty_retained_source=not frames, first_retained_sequence_id=frames[0]['event']['sequence_id'] if frames else None, through_sequence_id=last['event']['sequence_id'] if last else None, last_frame=None if last is None else dict(**{k: last[k] for k in ('segment_generation', 'segment_name', 'byte_offset', 'frame_end_offset')}, last_sequence_id=last['event']['sequence_id'], last_event_id=last['event']['event_id']), retained_event_count=len(frames), retained_event_prefix_sha256=index_prefix(frames), segments=source['segments'], sequence_gaps=source['sequence_gaps'], health='degraded' if any((g['reason'] == 'corruption_loss' for g in source['sequence_gaps'])) else 'healthy')

def index_generation(storage_instance_id, anchor):
    return 'eig_' + index_binding(dict(domain='pm.event_index.generation.v1', storage_instance_id=storage_instance_id, projector_version='1.0.0', birth_source_selection=anchor['source_selection'], generation_seed_sha256=anchor['generation_seed_sha256']))

def index_row(frame, generation, checkpoint_key):
    event = frame['event']
    birth = generation['anchor']['source_selection']
    return dict(schema_id='pm.storage_value.event_record_index.v2', schema_version='2.0.0', **{k: event[k] for k in ('scope_kind', 'project_id', 'sequence_id', 'event_id', 'event_type', 'idempotency_key', 'correlation_id', 'causation_event_id', 'persisted_at_utc', 'redaction_profile')}, scope_partition=index_partition(event), source_locator=dict(**{k: frame[k] for k in ('segment_generation', 'segment_name', 'byte_offset')}, sequence_id=event['sequence_id']), publication_locator=dict(manifest_generation=birth['manifest_generation'], recovery_epoch=birth['recovery_epoch'], survivor_prefix_sha256=birth['manifest_survivor_prefix_sha256'], checkpoint_ref=checkpoint_key + '#/generations/' + generation['generation_id'], compaction_translation_manifest_ref=None), payload_sha256=hashlib.sha256(canonical_msgpack(event['payload'])).hexdigest(), producer_semantic_digest=original_semantic_digest(event), source_schema_id=event['schema_id'], source_schema_version=event['schema_version'], projector_replay_only=event['replay_policy'] == 'projector_replay_only')

def index_rows_digest(rows):
    return index_binding(dict(domain='pm.event_index.row_set.v1', entries=[dict(key=k, value=v) for k, v in sorted(rows.items(), key=lambda pair: (pair[1]['sequence_id'], pair[1]['event_id']))]))

def index_content(index, reader, authority=None, event_validator=None):
    """SP-278 joins over captured source/rows, never the fixed example token.

    Captured controls, frame extents and transaction observations are synthetic
    trusted-adapter inputs. Native CRC/redb/fence proof remains NOT_RUN. This
    oracle covers direct-source rebuild/append snapshots; translation snapshots
    must use their separate owner validator, never an opaque translation ref.
    """
    cp = index['checkpoint']
    gid = cp['current_generation_id']
    generation = cp['generations'][gid]
    source = index['current_source']
    frontier = generation['frontier']
    anchor = generation['anchor']
    frames = source['frames']
    rows = index['datasets'][generation['index_dataset_name']]
    canonical_msgpack(cp)
    prepared = {r['event_type']: r for r in load('Plans/dcw_event_contract_fixtures.json')['families']}
    registered = {r['event_type']: r for r in load('Plans/event_family_registry.json')['families']}
    for frame in frames:
        event = frame['event']
        check_schema('Plans/event_record.schema.json', event)
        if event_validator is not None:
            event_validator(event, authority)
        elif event['event_type'] in prepared:
            envelope(prepared[event['event_type']], event, compatibility=event['replay_policy'] == 'projector_replay_only', authority=authority)
        else:
            owner = registered.get(event['event_type'])
            from pm_dcw_registered_schemas import validate_registered
            validate_registered(owner, event)
    guard_rows.enforce('O198', {'site': 'O198', 'code': 'index_source_binding', 'v0': typed_observation(source['source_selection']), 'v1': typed_observation(index_selection(source, cp['storage_instance_id']))})
    guard_rows.enforce('O199', {'site': 'O199', 'code': 'index_source_binding', 'v0': source['manifest']['selected_segment_generation'], 'v1': source['current']['selected_segment_generation']})
    guard_rows.enforce('O200', {'site': 'O200', 'code': 'index_source_binding', 'v0': source['manifest']['survivor_prefix_sha256'], 'v1': index_prefix(frames)})
    blobs = []
    segments = []
    for segment in source['segments']:
        members = [f for f in frames if (f['segment_generation'], f['segment_name']) == (segment['segment_generation'], segment['segment_name'])]
        blob = b''
        for frame in members:
            raw = canonical_msgpack(frame['event'])
            guard_rows.enforce('F001', {'site':'F001','code':'index_source_bytes','v0':source_frame_bytes(frame['source_value_bytes_base64']),'v1':raw})
            guard_rows.enforce('F002', {'site':'F002','code':'index_source_bytes','v0':typed_observation(frame['byte_offset']),'v1':typed_observation(len(blob))})
            guard_rows.enforce('F003', {'site':'F003','code':'index_source_bytes','v0':typed_observation(frame['frame_end_offset']),'v1':typed_observation(len(blob)+len(raw))})
            guard_rows.enforce('F004', {'site':'F004','code':'index_source_bytes','v0':frame['source_schema_id'],'v1':frame['event']['schema_id']})
            guard_rows.enforce('F005', {'site':'F005','code':'index_source_bytes','v0':frame['source_schema_version'],'v1':frame['event']['schema_version']})
            blob += raw
        blobs.append(blob)
        segments.append(dict(segment_generation=segment['segment_generation'], segment_name=segment['segment_name'], state=segment['state'], scan_start_offset=0, scanned_through_offset=len(blob), source_durable_end_offset=len(blob), source_durable_bytes_sha256=hashlib.sha256(blob).hexdigest(), retained_event_count=len(members), first_sequence_id=members[0]['event']['sequence_id'] if members else None, last_sequence_id=members[-1]['event']['sequence_id'] if members else None))
    sequences = [f['event']['sequence_id'] for f in frames]
    guard_rows.enforce('O202', {'site': 'O202', 'code': 'index_source_bytes', 'v0': sum((s['retained_event_count'] for s in segments)), 'v1': frames})
    guard_rows.enforce('O203', {'site': 'O203', 'code': 'index_source_bytes', 'v0': source_frame_bytes(source['source_bytes_base64']), 'v1': b''.join(blobs)})
    guard_rows.enforce('O204', {'site': 'O204', 'code': 'index_source_bytes', 'v0': typed_observation(source['segments']), 'v1': typed_observation(segments)})
    guard_rows.enforce('O205', {'site': 'O205', 'code': 'index_source_bytes', 'v0': typed_observation(source['manifest']['retained_inventory']), 'v1': typed_observation(segments)})
    guard_rows.enforce('O206', {'site': 'O206', 'code': 'index_source_bytes', 'v0': typed_observation(source['manifest']['durable_watermarks']), 'v1': typed_observation([dict(segment_name=s['segment_name'], durable_end_offset=s['source_durable_end_offset']) for s in segments])})
    guard_rows.enforce('O207', {'site': 'O207', 'code': 'index_source_bytes', 'v0': sequences, 'v1': sorted(set(sequences))})
    guard_rows.enforce('O208', {'site': 'O208', 'code': 'index_source_bytes', 'v0': frames})
    holes = [(a + 1, b - 1) for a, b in zip(sequences, sequences[1:]) if b != a + 1]
    gaps = source['sequence_gaps']
    guard_rows.enforce('O209', {'site': 'O209', 'code': 'index_source_gaps', 'v0': typed_observation(gaps), 'v1': typed_observation(source['manifest']['excluded_ranges'])})
    guard_rows.enforce('O210', {'site': 'O210', 'code': 'index_source_gaps', 'v0': gaps, 'v1': holes})
    for g in gaps:
        guard_rows.enforce('O211', {'site': 'O211', 'code': 'index_source_gaps', 'v0': g['reason']})
        guard_rows.enforce('O212', {'site': 'O212', 'code': 'index_source_gaps', 'v0': typed_observation(source.get('gap_evidence', {}).get(g['manifest_evidence_ref'])), 'v1': typed_observation(g)})
    guard_rows.enforce('O213', {'site': 'O213', 'code': 'index_source_coverage', 'v0': typed_observation(frontier['coverage']), 'v1': typed_observation(index_coverage(source))})
    guard_rows.enforce('O214', {'site': 'O214', 'code': 'index_generation_identity', 'v0': gid, 'v1': generation['generation_id']})
    guard_rows.enforce('O215', {'site': 'O215', 'code': 'index_generation_identity', 'v0': generation['generation_id'], 'v1': index_generation(cp['storage_instance_id'], anchor)})
    for k, g in cp['generations'].items():
        guard_rows.enforce('O216', {'site': 'O216', 'code': 'index_generation_identity', 'v0': k, 'v1': g['generation_id']})
        guard_rows.enforce('O217', {'site': 'O217', 'code': 'index_generation_identity', 'v0': g['generation_id'], 'v1': index_generation(cp['storage_instance_id'], g['anchor'])})
        guard_rows.enforce('O218', {'site': 'O218', 'code': 'index_generation_identity', 'v0': g['index_dataset_name'], 'v1': k})
    guard_rows.enforce('O219', {'site': 'O219', 'code': 'index_generation_identity', 'v0': [k for k, generation in cp['generations'].items() if generation['state'] == 'current'], 'v1': [gid]})
    guard_rows.enforce('O220', {'site': 'O220', 'code': 'index_generation_identity', 'v0': anchor['source_selection']['storage_instance_id'], 'v1': cp['storage_instance_id']})
    prefix = frames[:anchor['retained_event_count']]
    birth_gaps = [g for g in gaps if prefix and prefix[0]['event']['sequence_id'] <= g['first_sequence_id'] and (g['last_sequence_id'] <= prefix[-1]['event']['sequence_id'])]
    guard_rows.enforce('O221', {'site': 'O221', 'code': 'index_anchor_prefix', 'v0': anchor['retained_event_count'], 'v1': frames})
    guard_rows.enforce('O222', {'site': 'O222', 'code': 'index_anchor_prefix', 'v0': anchor['retained_event_prefix_sha256'], 'v1': index_prefix(prefix)})
    guard_rows.enforce('O223', {'site': 'O223', 'code': 'index_anchor_prefix', 'v0': anchor['first_retained_sequence_id'], 'v1': prefix[0]['event']['sequence_id'] if prefix else None})
    guard_rows.enforce('O224', {'site': 'O224', 'code': 'index_anchor_prefix', 'v0': anchor['through_sequence_id'], 'v1': prefix[-1]['event']['sequence_id'] if prefix else None})
    guard_rows.enforce('O225', {'site': 'O225', 'code': 'index_anchor_prefix', 'v0': anchor['sequence_gaps_sha256'], 'v1': index_binding(birth_gaps)})
    for k in ('current_bytes_sha256', 'selected_segment_generation', 'recovery_epoch'):
        guard_rows.enforce('O226', {'site': 'O226', 'code': 'index_anchor_prefix', 'v0': typed_observation(anchor['source_selection'][k]), 'v1': typed_observation(source['source_selection'][k])})
    expected_rows = {index_key(f['event']): index_row(f, generation, 'event_record_index_checkpoint.v1:' + cp['storage_instance_id']) for f in frames}
    guard_rows.enforce('O227', {'site': 'O227', 'code': 'index_row_membership', 'v0': sorted(rows.keys()), 'v1': sorted(expected_rows.keys())})
    for k in rows.keys() & expected_rows.keys():
        guard_rows.enforce('O228', {'site': 'O228', 'code': 'index_row_source', 'v0': typed_observation(rows[k]), 'v1': typed_observation(expected_rows[k])})
    guard_rows.enforce('O229', {'site': 'O229', 'code': 'index_row_digest', 'v0': frontier['index_row_set_sha256'], 'v1': index_rows_digest(rows)})
    guard_rows.enforce('O230', {'site': 'O230', 'code': 'index_frontier_digest', 'v0': reader['live_token']['frontier_sha256'], 'v1': index_binding(frontier)})

def index_event(index, event, authority):
    """Join the returned original and receipt to this captured complete source."""
    frames = index['current_source']['frames']
    selected = [f for f in frames if f['event']['event_id'] == event['event_id']]
    guard_rows.enforce('O231', {'site': 'O231', 'code': 'index_recovery_epoch', 'v0': typed_observation(index['current_source']['source_selection']['recovery_epoch']), 'v1': typed_observation(authority['recovery_epoch'])})
    guard_rows.enforce('O232', {'site': 'O232', 'code': 'index_event_join', 'v0': selected})
    guard_rows.enforce('O233', {'site': 'O233', 'code': 'index_event_join', 'v0': typed_observation(selected[0]['event']), 'v1': typed_observation(event)})

def typed_observation(value):
    """Derive exact type/sign-preserving physical bytes for a joined value.

    The independent schema/codec boundaries still admit the value domain.
    Unsupported sides get different labels so they never authenticate a join.
    """
    try:
        return canonical_msgpack(value).hex()
    except Refusal:
        return ['unsupported', type(value).__name__]

@lru_cache(maxsize=1)
def number_resource_manifest():
    return hashlib.sha256(b''.join((p.read_bytes() for p in SCHEMAS))).hexdigest()

def install_fixture_originals(scenario, *, legacy=False):
    number_custody.install_scenario(scenario, number_resource_manifest(), legacy=legacy)

def current_schema(schema):
    if type(schema) is dict:
        result = {k: current_schema(v) for k, v in schema.items()}
        types = result.get('type')
        if types == 'integer' or (type(types) is list and 'integer' in types):
            result['format'] = 'pm-uint'
        return result
    if type(schema) is list:
        return [current_schema(v) for v in schema]
    return schema

def admit_retry_request(row, request):
    token = HISTORICAL.set(False)
    try:
        if request.get('producer_sequence_id') is not None:
            numbers.current_integer(request['producer_sequence_id'], minimum=0)
        if request.get('payload_ref') is None:
            check_schema(row['schema'], request['payload'])
    except numbers.Refusal as exc:
        guard_rows.enforce('N002', {'site': 'N002', 'code': exc.reason, 'v0': 'refused'})
    else:
        guard_rows.enforce('N002', {'site': 'N002', 'code': 'current_integer', 'v0': None})
    finally:
        HISTORICAL.reset(token)

@contextmanager
def original_scope(enabled=True):
    if not enabled:
        yield
        return
    historical = HISTORICAL.set(True)
    passive = PASSIVE.set(True)
    try:
        yield
    finally:
        HISTORICAL.reset(historical)
        PASSIVE.reset(passive)


def admit_storage_sequence(value):
    """SP-026/SP-1100 owner uint64, separate from producer JCS eligibility."""
    try:
        numbers.storage_uint64(value)
    except numbers.Refusal as exc:
        guard_rows.enforce('N003', {'site':'N003','code':exc.reason,'v0':'refused'})
    else:
        guard_rows.enforce('N003', {'site':'N003','code':'storage_uint64','v0':None})


def schema_observation(value):
    """Exact schema-data observation, independent of a Storage numeric profile.

    Schema numeric keywords can exceed the physical EventRecord number domain.
    Tags retain numeric type and float bits; dictionary order has no authority.
    This is proof/metadata representation, never a product identity/hash recipe.
    """
    from decimal import Decimal
    def typed(item):
        if item is None:return ['null']
        if type(item) is bool:return ['bool',item]
        if type(item) is int:return ['int',format(Decimal(item),'f')]
        if type(item) is float:return ['float64',struct.pack('>d',item).hex()]
        if type(item) is str:return ['str',item]
        if type(item) is list:return ['array',[typed(v) for v in item]]
        if type(item) is dict:return ['object',[[k,typed(item[k])] for k in sorted(item)]]
        raise TypeError('schema data is outside its JSON primitive domain')
    return json.dumps(typed(value),ensure_ascii=True,separators=(',',':'))


def source_frame_bytes(value):
    """Decode the captured source byte observation before any hash or join."""
    try:
        result=base64.b64decode(value,validate=True)
    except (binascii.Error,ValueError,TypeError) as exc:
        guard_rows.enforce('F006', {'site':'F006','code':'index_source_bytes','v0':'refused'})
    else:
        guard_rows.enforce('F006', {'site':'F006','code':'index_source_bytes','v0':None})
    return result
