#!/usr/bin/env python3
"""DCH static contract checks. No admission, frozen validator or runtime simulation."""
import copy
import argparse
import base64
import binascii
import hashlib
import json
import math
from pathlib import Path
import re
import sys
from urllib.parse import unquote, urlparse
import blake3
import msgpack
import rfc8785
from jsonschema import Draft202012Validator
from pm_dch_formats import FormatChecker, legacy_format_checker
from jsonschema.exceptions import SchemaError
from referencing import Registry, Resource
from referencing.exceptions import NoSuchResource, Unresolvable
from referencing.jsonschema import DRAFT202012

ROOT = Path(__file__).resolve().parents[1]
STORAGE_INSTANCE = '00000000-0000-4000-8000-000000000001'
INLINE_LIMIT = 16 * 1024
UINT64_MAX = (1 << 64) - 1
SELECTED_FAMILY = None
# Reuse Storage's own instance descriptor, including its UUID format.
STORAGE_INSTANCE_DESCRIPTOR = json.loads((ROOT/'Plans/event_record_index_checkpoint.schema.json').read_text())['$defs']['checkpoint']['properties']['storage_instance_id']
STORAGE_INSTANCE_VALIDATOR = Draft202012Validator(STORAGE_INSTANCE_DESCRIPTOR, format_checker=FormatChecker())
# Exact EventRecord owner commitment. event_id has a separate integrity check.
SEMANTIC_FIELDS = (
    'event_type', 'scope_kind', 'project_id', 'thread_id', 'run_id', 'node_id',
    'attempt_id', 'actor_ref', 'requested_account_ref', 'effective_account_ref',
    'occurred_at_utc', 'producer_sequence_id', 'correlation_id', 'causation_event_id',
    'parent_event_id', 'idempotency_key', 'payload_schema_id', 'payload',
    'payload_ref', 'redaction_profile', 'migration')

def schema_reference_errors(schema, path):
    """Resolve the entire schema graph, even branches no positive traverses.

    Use JSON Schema resource scopes/anchors, not an instance-driven walk. File
    references are confined to the checkout; ambient network retrieval is refused.
    """
    retrieved_resources = {}
    def retrieve(uri):
        if uri in retrieved_resources:
            return retrieved_resources[uri]
        parsed = urlparse(uri)
        if parsed.scheme != 'file' or parsed.netloc:
            raise NoSuchResource(ref=uri)
        target = Path(unquote(parsed.path)).resolve()
        if not target.is_relative_to(ROOT):
            raise NoSuchResource(ref=uri)
        data = json.loads(target.read_text())
        Draft202012Validator.check_schema(data)
        resource = Resource.from_contents(data, default_specification=DRAFT202012)
        retrieved_resources[uri] = resource
        return resource

    errors = []
    seen = set()
    try:
        Draft202012Validator.check_schema(schema)
        resource = Resource.from_contents(schema, default_specification=DRAFT202012)
        registry = Registry(retrieve=retrieve).with_resource(path.resolve().as_uri(), resource).crawl()
        def visit(current, resolver):
            # Resolved recursive refs share the same parsed object. Each distinct
            # resource is checked once, including every sibling/optional branch.
            marker = id(current.contents)
            if marker in seen:
                return
            seen.add(marker)
            if isinstance(current.contents, dict):
                for keyword in ['$ref', '$dynamicRef']:
                    if keyword not in current.contents:
                        continue
                    ref = current.contents[keyword]
                    try:
                        resolved = resolver.lookup(ref)
                        Draft202012Validator.check_schema(resolved.contents)
                        child = Resource.from_contents(resolved.contents, default_specification=DRAFT202012)
                        visit(child, resolved.resolver)
                    except (Unresolvable, OSError, ValueError, SchemaError) as exc:
                        errors.append(f'{keyword} {ref}: {type(exc).__name__}')
            for child in current.subresources():
                visit(child, resolver.in_subresource(child))
        visit(resource, registry.resolver(path.resolve().as_uri()).in_subresource(resource))
        # A file ref may select a fragment. Its other optional/history branches
        # still belong to a loaded schema document and need complete closure.
        visited_files = set()
        while pending := set(retrieved_resources) - visited_files:
            registry = registry.with_resources(retrieved_resources.items()).crawl()
            for uri in sorted(pending):
                loaded = retrieved_resources[uri]
                visit(loaded, registry.resolver(uri).in_subresource(loaded))
                visited_files.add(uri)
    except (Unresolvable, OSError, ValueError, SchemaError) as exc:
        errors.append(f'schema: {type(exc).__name__}: {exc}')
    return errors

CURRENT_RULE = 'strict-v4'
RETAINED_RECIPES = json.loads((ROOT/'Plans/dch_retained_recipes.json').read_text())['recipes']
# This is the static adapter's independent Storage write-receipt catalogue,
# never an input accepted from an event, caller, pack or checkpoint candidate.
RECIPE_RECEIPTS = {(r['storage_instance_id'], r['source_value_sha256']): r['recipe_id']
                  for r in json.loads((ROOT/'Plans/dch_write_recipe_receipts.json').read_text())['receipts']}

def record_number_rule(provenance=None):
    """Sole recipe selector for numbers, physical bytes and schema formats.

    No provenance means a new write/current identity input: strict-v4. A retained
    source uses the recipe bound to its independently read Store + exact source
    commitment. Missing legacy provenance fails closed to the current recipe.
    A claimed recipe is only checked against that authority; it never selects it.
    Production must read this mapping from protected original write receipts;
    this catalogue models those observations, not receipt authenticity execution.
    """
    if provenance is None:
        return CURRENT_RULE
    if type(provenance) is not dict:
        return None
    lookup = getattr(provenance, 'get', lambda key, default=None: default)
    store, digest = lookup('storage_instance_id'), lookup('source_value_sha256')
    if type(store) is not str or type(digest) is not str:
        return None
    recipe = RECIPE_RECEIPTS.get((str(store), str(digest)), CURRENT_RULE)
    if lookup('recipe_id', recipe) != recipe:
        return None
    return recipe

def stored_validator(current, path, rule):
    """Use the entire original schema/format edition, not relaxed current prose."""
    if rule == CURRENT_RULE:
        return current
    return Draft202012Validator(RETAINED_RECIPES[rule]['schemas'][path],
                                format_checker=legacy_format_checker())

def historical_read_valid(record, row, witness, envelope, payload_validator):
    """Static retained-original lookup; current live state grants no authority.

    The witness models independently read canonical bytes and current access,
    not an admission or a replacement for native source/custody verification.
    """
    rule = record_number_rule(witness)
    if rule is None:
        return False
    if not input_types_valid({'record': record, 'witness': witness}, rule):
        return False
    envelope = stored_validator(envelope, 'Plans/event_record.schema.json', rule)
    path = row.get('payload_schema_ref', 'Plans/dch_event_payloads/'+row['event_type'].replace('.', '_')+'.schema.json')
    payload_validator = stored_validator(payload_validator, path, rule)
    try:
        source_commitment = hashlib.sha256(body_bytes(record, rule)).hexdigest()
    except (ValueError, OverflowError):
        return False
    body = resolve_body(record, witness.get('payload_source'), witness['storage_instance_id'], rule)
    if (body is None or not envelope.is_valid(record) or not payload_validator.is_valid(body)
            or not all(witness[k] is True for k in ['retained', 'authorized', 'hold_access_allowed'])
            or witness['deleted'] is not False or witness['event_withdrawn'] is not False
            or source_commitment != witness['source_value_sha256']
            or record['replay_policy'] not in ['dedupe_by_idempotency_key', 'projector_replay_only']):
        return False
    # Compatibility-reader policy never calls the current append/retry oracle.
    original = {**record, 'replay_policy': 'dedupe_by_idempotency_key'}
    return joins(original, row['event_type'], witness.get('payload_source'), witness['storage_instance_id'], rule)

def body_bytes(value, rule=CURRENT_RULE):
    """SP-236 shortest MessagePack, recursively sorted exact UTF-8 map keys."""
    def ordered(v):
        # SP-236 shortest numeric representation: integral finite floats and
        # either signed zero have the same bytes as their integer value.
        if type(v) is float and rule != 'raw-v1':
            if not math.isfinite(v):
                raise ValueError('non-finite number')
            if not v.is_integer():
                return v
            v = int(v)
        if isinstance(v, dict):
            return {k: ordered(v[k]) for k in sorted(v, key=lambda k: k.encode('utf-8'))}
        if isinstance(v, list):
            return [ordered(x) for x in v]
        return v
    try:
        return msgpack.packb(ordered(value), use_bin_type=True, strict_types=True)
    except OverflowError as exc:
        raise ValueError('integer outside DCH MessagePack domain') from exc

def input_types_valid(value, rule=CURRENT_RULE):
    """Exact witness types before truth/equality/arithmetic, including bool/int.

    DCH declares integer slots, no floating point slots. Physical encoding still
    canonicalizes numeric aliases, so a rejected alternate cannot mint a digest.
    Schema validation owns field presence, strings, enums and logical bounds.
    """
    if rule == 'raw-v1':
        # Original schema validators own numeric slots; the raw encoder keeps
        # integer-valued floats verbatim. Do not coerce their committed bytes.
        return True
    integers = {'sequence_id', 'producer_sequence_id', 'revision', 'frontier_revision',
                'last_sequence_id', 'selected_segment_generation', 'manifest_generation',
                'recovery_epoch', 'expected_thread_revision', 'committed_thread_revision',
                'expected_revision', 'duration_ms', 'pr_number', 'byte_size'}
    objects = {'payload', 'body', 'scope', 'source_token', 'source_selection', 'migration', 'record', 'witness', 'source', 'value',
               'retry', 'pointer', 'pack', 'checkpoint_storage', 'event_record', 'event_access',
               'checkpoint', 'index_row', 'publication', 'before', 'after', 'request',
               'started', 'outcome', 'live_state', 'generations'}
    arrays = {'projection_refs', 'history', 'attachment_refs', 'provenance_refs'}
    strings = {'operation_id', 'computer_id', 'actor_ref', 'schema_id', 'schema_version',
               'scope_kind', 'scope_partition', 'server_id', 'event_type'}
    if type(value) is list:
        return all(input_types_valid(v, rule) for v in value)
    if type(value) is not dict:
        return type(value) in [str, bool, int, type(None)]
    for key, v in value.items():
        if type(key) is not str:
            return False
        if key == 'storage_instance_id' and not STORAGE_INSTANCE_VALIDATOR.is_valid(v):
            return False
        if key in integers and not (type(v) is int or (key == 'producer_sequence_id' and v is None)):
            return False
        # Storage metadata retains the owner's exact uint64 range. Producer
        # integers keep their own schema domain; RFC8785 route work is separate.
        if rule == CURRENT_RULE and key in {'sequence_id', 'last_sequence_id',
                'frontier_revision', 'selected_segment_generation',
                'manifest_generation', 'recovery_epoch', 'byte_size'}:
            if not (type(v) is int and 0 <= v <= UINT64_MAX):
                return False
        if key in objects and type(v) is not dict:
            return False
        if key in arrays and type(v) is not list:
            return False
        if key in strings and type(v) is not str:
            return False
        if not input_types_valid(v, rule):
            return False
    return True

def payload_reference(body, rule=CURRENT_RULE):
    raw = body_bytes(body, rule)
    return f'payload:v1:{blake3.blake3(raw).hexdigest()}:{len(raw)}:application/msgpack'

def resolve_body(record, source=None, storage_instance=STORAGE_INSTANCE, rule=CURRENT_RULE):
    """Static SP-337 pack/readback/access fixture; not native durability proof."""
    if not input_types_valid({'record': record, 'storage_instance_id': storage_instance,
                              **({'source': source} if source is not None else {})}, rule):
        return None
    try:
        body_bytes(record['payload'] if record['payload_ref'] is None else source['body'] if source else {}, rule)
    except (ValueError, OverflowError):
        return None
    if record['payload_ref'] is None:
        return record['payload'] if len(body_bytes(record['payload'], rule)) <= INLINE_LIMIT else None
    if record['payload'] != {} or not source:
        return None
    body = source['body']
    raw = body_bytes(body, rule)
    if (record['payload_ref'] != payload_reference(body, rule)
            or source['key'] != 'payload:v1:' + blake3.blake3(raw).hexdigest()
            or source['byte_size'] != len(raw) or source['media_type'] != 'application/msgpack'
            or source['storage_instance_id'] != storage_instance
            or source['scope'] != body['scope'] or source['computer_id'] != body['computer_id']
            or source['thread_id'] != body['thread_id']
            or not all(source[k] is True for k in ['authorized', 'hold_access_allowed', 'bytes_durable',
                                           'index_durable', 'readback_verified'])
            or source['deleted'] is not False):
        return None
    return body

def identity(event, payload, storage_instance=STORAGE_INSTANCE):
    parts = [event, '1.0.0', storage_instance, payload['scope'], payload['computer_id'], payload['thread_id'], payload['operation_id']]
    # Fixture inputs have no floating point; this is the RFC8785 subset.
    value = rfc8785.dumps(parts)
    return 'evt_dch_' + hashlib.sha256(value).hexdigest()

def valid_scope_partition(scope):
    """CV-365 semantic join, independent of schema shape/envelope equality."""
    if scope['scope_kind'] == 'application':
        return scope['scope_partition'] == 'app' and all(
            scope[key] is None for key in ['project_id', 'project_home_server_id', 'named_plan_id'])
    project_id = scope['project_id']
    partition = scope['scope_partition']
    if scope['scope_kind'] != 'project' or not isinstance(project_id, str) or not project_id:
        return False
    if not partition.startswith('project~'):
        return False
    encoded = partition[len('project~'):]
    if not re.fullmatch(r'[A-Za-z0-9_-]+', encoded):
        return False
    try:
        decoded = base64.b64decode(encoded + '=' * (-len(encoded) % 4), altchars=b'-_', validate=True)
        exact = project_id.encode('utf-8')
        return (decoded.decode('utf-8') == project_id and decoded == exact
                and base64.urlsafe_b64encode(exact).decode('ascii').rstrip('=') == encoded)
    except (ValueError, UnicodeError, binascii.Error):
        return False

def idempotency_key(event, payload, storage_instance=STORAGE_INSTANCE):
    if payload['scope']['scope_kind'] == 'application':
        return ('application@1:' + payload['scope']['server_id'].encode('utf-8').hex()
                + ':' + payload['operation_id'].encode('utf-8').hex())
    return 'dch:' + identity(event, payload, storage_instance)[len('evt_dch_'):]

def joins(record, event, source=None, storage_instance=STORAGE_INSTANCE, rule=CURRENT_RULE):
    p = resolve_body(record, source, storage_instance, rule)
    if p is None or record['replay_policy'] != 'dedupe_by_idempotency_key':
        return False
    expected = {'event_type': event, 'event_id': identity(event, p, storage_instance),
                'idempotency_key': idempotency_key(event, p, storage_instance), 'payload_schema_id': p['schema_id'],
                'scope_kind': p['scope']['scope_kind'], 'project_id': p['scope']['project_id'],
                'thread_id': p['thread_id'], 'actor_ref': p['actor_ref'], 'occurred_at_utc': p['ts'],
                'run_id': None, 'node_id': None, 'attempt_id': None}
    return valid_scope_partition(p['scope']) and all(record[k] == value for k, value in expected.items())

def retry_outcome(original, retry, available=True, original_provenance=None):
    """Static CV-366 oracle; does not exercise a writer, receipt or real dedupe store."""
    rule = record_number_rule(original_provenance)
    if rule is None or not input_types_valid({'record': original}, rule) or not input_types_valid({'retry': retry}) or type(available) is not bool:
        return 'invalid_input_type'
    if any(r['replay_policy'] == 'projector_replay_only' for r in [original, retry]):
        return 'replay_only_not_appendable'
    if any(r['replay_policy'] != 'dedupe_by_idempotency_key' for r in [original, retry]):
        return 'invalid_append_policy'
    if original_provenance is not None:
        # Stored original and incoming retry are different trust/type domains.
        # The same history reader owns original bytes, schema and current custody.
        row = {'event_type': original['event_type']}
        path = 'Plans/dch_event_payloads/'+original['event_type'].replace('.', '_')+'.schema.json'
        try:
            envelope = Draft202012Validator(json.loads((ROOT/'Plans/event_record.schema.json').read_text()), format_checker=FormatChecker())
            payload_validator = Draft202012Validator(json.loads((ROOT/path).read_text()), format_checker=FormatChecker())
        except (OSError, ValueError):
            return 'invalid_input_type'
        incoming_body = resolve_body(retry, original_provenance.get('payload_source'), original_provenance['storage_instance_id'])
        if incoming_body is None or not envelope.is_valid(retry) or not payload_validator.is_valid(incoming_body):
            return 'invalid_input_type'
        if not historical_read_valid(original, row, original_provenance, envelope, payload_validator):
            return 'invalid_input_type'
    if available is False:
        return 'dedupe_unavailable'
    def lifetime(r):
        # Exact scope identities are equivalent to their validated reversible
        # partition. Keep malformed cross-scope mutations comparable as well.
        return (r['scope_kind'], r['project_id'], r['event_type'], r['idempotency_key'])
    if lifetime(original) != lifetime(retry):
        if original['event_id'] == retry['event_id']:
            return 'conflict'
        return 'distinct_operation'
    if original['event_id'] != retry['event_id']:
        return 'conflict'
    def commitment(r):
        return hashlib.sha256(rfc8785.dumps({k: r[k] for k in SEMANTIC_FIELDS})).digest()
    if rule != CURRENT_RULE and any(original[k] != retry[k] for k in SEMANTIC_FIELDS):
        # An earlier out-of-current-domain semantic value cannot equal a valid
        # current retry. Compare that difference without sending it to today's
        # RFC8785 safe-domain encoder or changing its original stored recipe.
        return 'conflict'
    try:
        return 'original_result' if commitment(original) == commitment(retry) else 'conflict'
    except (rfc8785.CanonicalizationError, OverflowError):
        # Defense in depth for the same numeric admission rule. An encoder
        # refusal is structured; no rounding, string substitution or crash.
        return 'invalid_input_type'

def test_joins(payload, source, event):
    """Original started operation and actual terminal outcome, W.9.2/W.9.3."""
    if not input_types_valid({'payload': payload, 'source': {k:v for k,v in source.items() if k not in ['started', 'started_access']}}):
        return False
    started, outcome = source['started'], source['outcome']
    schema = json.loads((ROOT/'Plans/dch_event_payloads/chat_thread_worktree_pre_merge_test_started.schema.json').read_text())
    envelope = json.loads((ROOT/'Plans/event_record.schema.json').read_text())
    witness = source['started_access']
    started_row = {'event_type': 'chat.thread_worktree_pre_merge_test_started'}
    if not historical_read_valid(started, started_row, witness,
            Draft202012Validator(envelope, format_checker=FormatChecker()),
            Draft202012Validator(schema, format_checker=FormatChecker())):
        return False
    p = resolve_body(started, witness.get('payload_source'), witness['storage_instance_id'], record_number_rule(witness))
    common = ['operation_id', 'scope', 'computer_id', 'thread_id', 'worktree_id', 'command', 'strategy']
    if (p is None or payload['started_event_id'] != started['event_id']
            or outcome['started_event_id'] != started['event_id']
            or any(payload[k] != p[k] or payload[k] != outcome[k] for k in common)
            or payload['duration_ms'] != outcome['duration_ms']):
        return False
    if event.endswith('_passed'):
        return outcome['kind'] == 'exit' and type(outcome['exit_code']) is int and outcome['exit_code'] == 0
    if payload['test_outcome'] != outcome['kind'] or payload['exit_code'] != outcome['exit_code']:
        return False
    if payload['error_ref'] != outcome['error_ref']:
        return False
    if outcome['kind'] == 'exit':
        return type(outcome['exit_code']) is int and outcome['exit_code'] != 0 and payload['error_ref'] is None
    return (outcome['kind'] in ['timeout', 'process_error'] and outcome['exit_code'] is None
            and (outcome['kind'] != 'process_error' or payload['error_ref'] is not None))

def checkpoint_joins(value, source, row, key):
    """Independent synthetic source/root/dataset/publication joins under SP-278."""
    rule = record_number_rule(source.get('checkpoint_access'))
    if rule is None:
        return False
    current_source = {k:v for k,v in source.items() if k not in ['event_record','event_access','payload_source','index_row','checkpoint_storage']}
    index_metadata = {k:v for k,v in source['index_row'].items() if k != 'sequence_id'}
    if not input_types_valid(value, rule) or not input_types_valid({'source': current_source, 'index_row': index_metadata}):
        return False
    schema_path = 'Plans/dch_event_payloads/dch_'+row['event_type'].replace('.', '_')+'_checkpoint.schema.json'
    schema = Draft202012Validator(json.loads((ROOT/schema_path).read_text()), format_checker=FormatChecker())
    if not stored_validator(schema, schema_path, rule).is_valid(value):
        return False
    token = value['source_token']
    store = source['storage_instance_id']
    generation = token['generation_id']
    root = source['checkpoint']
    node = root['generations'].get(generation)
    event = source['event_record']
    envelope = Draft202012Validator(json.loads((ROOT/'Plans/event_record.schema.json').read_text()), format_checker=FormatChecker())
    payload_validator = Draft202012Validator(json.loads((ROOT/row['payload_schema_ref']).read_text()), format_checker=FormatChecker())
    witness = {**source['event_access'], 'storage_instance_id': store,
               'source_value_sha256': source['index_row']['source_value_sha256'],
               'payload_source': source.get('payload_source')}
    if not historical_read_valid(event, row, witness, envelope, payload_validator):
        return False
    p = resolve_body(event, source.get('payload_source'), store, record_number_rule(witness))
    generic_key = 'event_record_index_checkpoint.v1:' + store
    if not node:
        return False
    index = source['index_row']
    if type(index['sequence_id']) is not type(event['sequence_id']):
        return False
    return (value['storage_instance_id'] == token['storage_instance_id']
            == token['source_selection']['storage_instance_id'] == root['storage_instance_id'] == store
            and root['current_generation_id'] == generation and node['state'] == 'current'
            and token['checkpoint_key'] == source['checkpoint_key'] == generic_key
            and token['checkpoint_ref'] == generic_key + '#/generations/' + generation
            and token['generation_anchor_sha256'] == node['anchor_sha256']
            and token['frontier_revision'] == node['frontier_revision']
            and token['frontier_sha256'] == node['frontier_sha256']
            and token['source_selection'] == node['source_selection'] == source['current_source_selection']
            and token['index_dataset_name'] == node['index_dataset_name'] == source['dataset_name']
            == 'event_record_index.v2@' + generation
            and index['checkpoint_ref'] == token['checkpoint_ref']
            and index['event_id'] == value['last_event_id'] == event['event_id']
            and index['sequence_id'] == value['last_sequence_id'] == event['sequence_id']
            and index['scope_partition'] == value['scope_partition'] == p['scope']['scope_partition']
            and index['event_type'] == value['event_type'] == row['event_type'] == event['event_type']
            and key == row['domain_checkpoint_key'].format(storage_instance_id=store,
                                                          scope_partition=value['scope_partition'])
            and value['consumer_id'] == row['reader'] and value['projector_id'] == row['domain_projector']
            and value['projection_refs'] == source['publication']['projection_refs']
            and value['publication_id'] == source['publication']['publication_id']
            and value['revision'] == source['publication']['revision']
            and source['publication']['source_token'] == token
            and source['publication']['thread_id'] == p['thread_id']
            and source['publication']['computer_id'] == p['computer_id']
            and source['publication']['scope'] == p['scope']
            and value['state'] == 'current'
            and checkpoint_storage_valid(value, source, row, key))

def checkpoint_storage_valid(value, source, row, key):
    """Actual inline value, or SP-337 pointer plus independent pack/index read.

    Logical schema validation applies to the resolved complete checkpoint.
    Every physically inline part, including the pointer, is byte measured.
    """
    rule = record_number_rule(source.get('checkpoint_access'))
    if rule is None:
        return False
    if not input_types_valid(value, rule):
        return False
    # Owner-valid logical integers can exceed this physical codec's range.
    # Contain its refusal before any provenance hash uses the encoded bytes.
    try:
        raw = body_bytes(value, rule)
    except (ValueError, OverflowError):
        return False
    provenance = source.get('checkpoint_access')
    if provenance is not None and hashlib.sha256(raw).hexdigest() != provenance['source_value_sha256']:
        return False
    physical = source.get('checkpoint_storage')
    if physical is not None and not input_types_valid({'pointer':physical['pointer'], 'pack':{k:v for k,v in physical['pack'].items() if k != 'body'}}):
        return False
    if physical is not None and not input_types_valid(physical['pack']['body'], rule):
        return False
    if physical is None:
        return len(body_bytes(value, rule)) <= INLINE_LIMIT
    packed = physical['pack']
    pointer = physical['pointer']
    try:
        return (len(body_bytes(pointer)) <= INLINE_LIMIT
                and pointer == {'payload_ref': payload_reference(value, rule)}
                and body_bytes(packed['body'], rule) == raw
                and packed['key'] == 'payload:v1:' + blake3.blake3(raw).hexdigest()
                and packed['byte_size'] == len(raw)
                and packed['media_type'] == 'application/msgpack'
                and packed['storage_instance_id'] == source['storage_instance_id']
                and packed['domain_key'] == key
                and packed['scope_partition'] == value['scope_partition']
                and packed['event_type'] == row['event_type']
                and all(packed[k] is True for k in ['authorized', 'hold_access_allowed', 'bytes_durable', 'index_durable', 'readback_verified'])
                and packed['deleted'] is False)
    except (ValueError, OverflowError):
        return False

def archive_joins(payload, source):
    """Static original request/commit fixture joins; never an authorization receipt."""
    if not input_types_valid({'payload': payload, 'source': source}):
        return False
    before, after, request = source['before'], source['after'], source['request']
    return (payload['archive_origin'] == 'manual' and payload['command_id'] == 'cmd.chat.archive'
            and request['origin'] == 'manual' and request['command_id'] == payload['command_id']
            and request['permission_allowed'] is True and request['thread_selected'] is True and before['active_run'] is False
            and before['state'] in ['active', 'suspended'] and payload['previous_state'] == before['state']
            and payload['state'] == after['state'] == 'archived' and after['readback_available'] is True
            and payload['expected_thread_revision'] == before['revision'] == request['expected_revision']
            and payload['committed_thread_revision'] == after['revision'] == before['revision'] + 1
            and payload['thread_record_ref'] == after['record_ref']
            and all(obj[key] == payload[key] for obj in [before, after, request]
                    for key in ['thread_id', 'computer_id', 'scope', 'operation_id']))

def semantic_body_mutation(record, event):
    """One schema-valid result fact, preserving all envelope identity copies."""
    schema = json.loads((ROOT/'Plans/dch_event_payloads'/
                         (event.replace('.', '_')+'.schema.json')).read_text())
    validator = Draft202012Validator(schema, format_checker=FormatChecker())
    p = record['payload']
    baseline_valid = validator.is_valid(p)
    fields = schema['$defs'][p['scope']['scope_kind']]['properties']
    identity_fields = {'schema_id','schema_version','scope','operation_id','thread_id',
                       'computer_id','actor_ref','ts'}
    for key, old in p.items():
        if key in identity_fields or not isinstance(old, str):
            continue
        definition = fields[key]
        choices = definition.get('enum', [old+':changed'])
        for value in choices:
            if value == old:
                continue
            candidate = copy.deepcopy(p); candidate[key] = value
            # A regression campaign may deliberately invalidate the positive.
            # Preserve that defect for the ordinary positive check; the helper
            # still changes exactly one independently valid result field.
            if (Draft202012Validator(definition, format_checker=FormatChecker()).is_valid(value)
                    and (not baseline_valid or validator.is_valid(candidate))):
                return candidate
    raise AssertionError('No independent semantic-body fixture for '+event)

def main():
    contracts = json.loads((ROOT/'Plans/dch_event_contracts.json').read_text())['rows']
    fixtures = json.loads((ROOT/'Plans/dch_event_contract_fixtures.json').read_text())
    checkpoints = json.loads((ROOT/'Plans/dch_checkpoint_fixtures.json').read_text())
    stored = json.loads((ROOT/'Plans/storage_value_registry.json').read_text())['families']
    registry = json.loads((ROOT/'Plans/event_family_registry.json').read_text())
    if SELECTED_FAMILY is not None:
        contracts = [r for r in contracts if r['event_type'] == SELECTED_FAMILY]
        fixtures = [f for f in fixtures if f['event_type'] == SELECTED_FAMILY]
        checkpoints = [c for c in checkpoints if c['event_type'] == SELECTED_FAMILY]
        if len(contracts) != 1:
            raise ValueError('Unknown DCH family: '+SELECTED_FAMILY)
    failures = []
    checks = 0
    per_family = {}
    reference_results = {}
    def reference_errors(schema, path):
        # Per-run only: equal selected/embedded definitions have the same graph.
        # A new main() call always re-reads and rechecks mutated inputs.
        key = (str(path), json.dumps(schema,sort_keys=True))
        if key not in reference_results:
            reference_results[key] = schema_reference_errors(schema,path)
        return reference_results[key]
    def check(ok, label):
        nonlocal checks
        checks += 1
        family = label.split(':', 1)[0]
        stats = per_family.setdefault(family, {'checks': 0, 'failures': 0})
        stats['checks'] += 1
        if not ok:
            failures.append(label)
            stats['failures'] += 1
    def finish():
        print(json.dumps({'status':'pass' if not failures else 'fail','checks':checks,'failures':failures,
                          'per_family':per_family,'native_execution':'NOT_RUN',
                          'coverage':'Static standing checks 1-10; check 11 proof machinery awaits shared pm_guard_isolation.py adoption (legacy grouped proofs are not certification): append, transport, retry, registry parity, complete schema-reference closure, populated histories, retained-original lookup and checkpoint relations. Source/access adapters are synthetic. Native process, receipt, CRC, full-source coverage, redb CAS, durability, custody and withdrawal are NOT_RUN.'},indent=2))
        return bool(failures)
    # Preflight every selected schema before validating a single instance. In
    # particular an empty history must not conceal an unresolved reference.
    for row in contracts:
        check(row['outcome'] == 'register_prepared', row['event_type'] + ': prepared candidate remains prepared')
        if row['outcome'] == 'blocked_on_Jared':
            continue
        event = row['event_type']
        schemas = [(row['payload_schema_ref'].split('#')[0], 'payload')]
        cases = [c for c in checkpoints if c['event_type'] == event]
        check(len(cases) == 1, event + ': one checkpoint fixture')
        for case in cases:
            path = case['schema_ref'].split('#')[0]
            schema = json.loads((ROOT/path).read_text())
            schemas.append((path, 'selected checkpoint'))
            entries = [s for s in stored if s['value_schema_id'] == schema['$id']]
            check(len(entries) == 1, event + ': one registered checkpoint schema')
            for entry in entries:
                check(entry['value_schema_ref'] == case['schema_ref']
                      and entry['schema_version'] == schema['properties']['schema_version']['const']
                      and entry['value_schema'] == schema,
                      event + ': registered checkpoint exactly equals selected schema')
                errors = reference_errors(entry['value_schema'], ROOT/path)
                check(not errors, event + ': registered checkpoint reference closure ' + '; '.join(errors))
        for recipe, original in RETAINED_RECIPES.items():
            for path in ['Plans/event_record.schema.json', row['payload_schema_ref'].split('#')[0], cases[0]['schema_ref'].split('#')[0]]:
                errors = reference_errors(original['schemas'][path], ROOT/path)
                check(not errors, event + ': retained '+recipe+' reference closure '+path+'; '.join(errors))
        schemas.append(('Plans/event_record.schema.json', 'envelope'))
        for path, kind in schemas:
            errors = reference_errors(json.loads((ROOT/path).read_text()), ROOT/path)
            check(not errors, event + ': ' + kind + ' reference closure ' + '; '.join(errors))
    if failures:
        return finish()
    def leaf_paths(value, path=()):
        if isinstance(value, dict):
            for k, v in value.items():
                yield from leaf_paths(v, path + (k,))
        elif isinstance(value, list):
            for k, v in enumerate(value):
                yield from leaf_paths(v, path + (k,))
        else:
            yield path, value
    def changed(value, path, replacement):
        result = copy.deepcopy(value)
        target = result
        for k in path[:-1]:
            target = target[k]
        target[path[-1]] = replacement
        return result
    def trailing_lf_checks(value, schema, validator, label):
        patterns = []
        def collect(s):
            if isinstance(s, dict):
                if 'pattern' in s:
                    patterns.append(s['pattern'])
                    check(s['pattern'].endswith(r'$(?![\s\S])'), label + ': exact regex guard ' + s['pattern'])
                for v in s.values(): collect(v)
            elif isinstance(s, list):
                for v in s: collect(v)
        collect(schema)
        for path, value_at_path in leaf_paths(value):
            if isinstance(value_at_path, str) and any(re.search(p, value_at_path) for p in patterns):
                check(not validator.is_valid(changed(value, path, value_at_path + '\n')),
                      label + ': trailing LF ' + '.'.join(map(str, path)))
    for row in contracts:
        event = row['event_type']
        check(row['append_policy'] == 'dedupe_by_idempotency_key', event + ': selected current append policy')
        check(event not in [f['event_type'] for f in registry['families']], event+': absent registry')
        if row['outcome']=='blocked_on_Jared':
            continue
        schema = json.loads((ROOT/row['payload_schema_ref']).read_text())
        validator = Draft202012Validator(schema, format_checker=FormatChecker())
        cases = [f for f in fixtures if f['event_type']==event]
        check(len(cases)==2, event+': two editions')
        ids = []
        for case in cases:
            p = case['valid']
            check(validator.is_valid(p) and valid_scope_partition(p['scope']), event+': '+case['edition']+' positive')
            trailing_lf_checks(p, schema, validator, event + ':' + case['edition'])
            if 'exit_code' not in p:
                invalid=copy.deepcopy(p);invalid['exit_code']=0
                check(not validator.is_valid(invalid),event+': no fabricated exit-code outcome')
            ids.append(identity(event, p))
            for field in case['missing_fields']:
                invalid=copy.deepcopy(case.get('missing_field_bases',{}).get(field,p)); del invalid[field]
                check(not validator.is_valid(invalid), event+': missing '+field)
            for name in ['extra_field','wrong_version','scope_mismatch']:
                invalid=copy.deepcopy(p)
                if name=='extra_field': invalid['unexpected']=True
                if name=='wrong_version': invalid['schema_version']='9.0.0'
                if name=='scope_mismatch': invalid['scope']['project_id']='alien' if case['edition']=='application' else None
                check(not validator.is_valid(invalid),event+': '+name)
            # Operation identity is independent of payload result: changed content
            # must be compared using the persisted semantic digest, never re-keyed.
            invalid=copy.deepcopy(p); invalid['actor_ref']='pmref:fixture:other_actor'
            check(identity(event,p)==identity(event,invalid),event+': stable retry key')
            check(hashlib.sha256(json.dumps(p,sort_keys=True).encode()).digest()!=hashlib.sha256(json.dumps(invalid,sort_keys=True).encode()).digest(), event+': changed semantics digest')
            for oracle in case.get('partition_oracles', []):
                scope=copy.deepcopy(p['scope']); scope.update(project_id=oracle['project_id'], scope_partition=oracle['scope_partition'])
                check(valid_scope_partition(scope)==oracle['expected_valid'],event+': partition '+oracle['name'])
                if oracle['expected_valid']:
                    # Also validate complete non-ASCII/punctuation payloads and their records.
                    sample=copy.deepcopy(case['record']); sample['payload']['scope']=scope
                    sample['project_id']=scope['project_id']; sample['event_id']=identity(event,sample['payload'])
                    sample['idempotency_key']=idempotency_key(event,sample['payload'])
                    check(validator.is_valid(sample['payload']) and joins(sample,event),event+': partition record '+oracle['name'])
        check(len(set(ids))==2,event+': separated scope identities')
        for doc, unit_key in [('assistant-chat-design.md','owner_unit'),('Contracts_V0.md','payload_unit'),('storage-plan.md','storage_unit')]:
            text=(ROOT/'Plans'/doc).read_text()
            check('plan_unit_id: '+row[unit_key] in text,event+': owner '+unit_key)
        storage=(ROOT/'Plans/storage-plan.md').read_text().split('### '+row['storage_unit']+' — ',1)[1].split('```yaml',1)[0]
        for token in ['SP-278','SP-286','PENDING_RETENTION_DECISION',row['reader'],row['projector'],'Withdrawal']:
            check(token in storage,event+': adoption '+token)
    envelope=Draft202012Validator(json.loads((ROOT/'Plans/event_record.schema.json').read_text()), format_checker=FormatChecker())
    for case in fixtures:
        record=case['record']; event=case['event_type']
        check(case['storage_instance_id']==STORAGE_INSTANCE,event+': actual Storage fixture instance')
        check(envelope.is_valid(record) and joins(record,event) and record['payload']==case['valid'], event+': envelope and source joins')
        for key in ['event_type','event_id','idempotency_key','payload_schema_id','scope_kind','project_id','thread_id','actor_ref','occurred_at_utc','payload_ref','run_id','node_id','attempt_id']:
            if key=='payload_ref':
                reference=next(o for o in case['transport_oracles'] if o['name']=='authorized_payload_reference')
                invalid=copy.deepcopy(reference['record']);parts=invalid['payload_ref'].split(':');parts[2]='c'*64
                invalid['payload_ref']=':'.join(parts)
                check(not joins(invalid,event,reference['source']),event+': envelope mismatch '+key)
            else:
                invalid=copy.deepcopy(record);invalid[key]='wrong'
                check(not joins(invalid,event),event+': envelope mismatch '+key)
        for key in ['event_id','idempotency_key']:
            invalid=copy.deepcopy(record);invalid[key]+='\n'
            check(not joins(invalid,event),event+': identifier trailing LF '+key)
        for oracle in case['retry_oracles']:
            retry=copy.deepcopy(record)
            retry.update(oracle.get('record_changes', {}))
            for key,value in oracle.get('payload_changes',{}).items():
                retry['payload'][key]=value
            if 'actor_ref' in oracle.get('payload_changes',{}): retry['actor_ref']=retry['payload']['actor_ref']
            check(retry_outcome(record,retry,oracle.get('dedupe_available',True))==oracle['expected'],event+': retry '+oracle['name'])
            if oracle['expected'] in ['conflict','original_result']:
                check(joins(retry,event),event+': retry preserves key '+oracle['name'])
        for policy in ['projector_replay_only', 'append_once', 'dedupe_by_event_id']:
            invalid=copy.deepcopy(record); invalid['replay_policy']=policy
            check(envelope.is_valid(invalid) and not joins(invalid,event),event+': forbidden append '+policy)
            expected='replay_only_not_appendable' if policy=='projector_replay_only' else 'invalid_append_policy'
            for first, second in [(record,invalid),(invalid,record),(invalid,invalid)]:
                check(retry_outcome(first,second)==expected,event+': forbidden retry '+policy)
        # Every owner-included semantic field must affect the result, independently.
        for key in SEMANTIC_FIELDS:
            retry=copy.deepcopy(record)
            old=retry[key]
            if key=='payload': retry[key]=semantic_body_mutation(record,event)
            elif key=='migration': retry[key]['migration_id']='changed'
            elif key=='producer_sequence_id': retry[key]=7
            elif key=='scope_kind': retry[key]='application' if old=='project' else 'project'
            elif key=='project_id': retry[key]='other_project'
            else: retry[key]='changed' if old is None else str(old)+':changed'
            if key=='actor_ref': retry['payload']['actor_ref']=retry['actor_ref']
            check(retry_outcome(record,retry)=='conflict',event+': semantic commitment '+key)
        retry=copy.deepcopy(record);retry['event_id']+='changed'
        check(retry_outcome(record,retry)=='conflict',event+': global event-ID integrity')
        for key, value in [('sequence_id',2),('observed_at_utc','2026-11-04T00:00:01Z'),('persisted_at_utc','2026-11-04T00:00:02Z')]:
            retry=copy.deepcopy(record);retry[key]=value
            check(retry_outcome(record,retry)=='original_result',event+': excluded Storage metadata '+key)
        schema=json.loads((ROOT/next(r['payload_schema_ref'] for r in contracts if r['event_type']==event)).read_text())
        validator=Draft202012Validator(schema,format_checker=FormatChecker())
        row=next(r for r in contracts if r['event_type']==event)
        for oracle in case['historical_oracles']:
            combined={'record':record,'witness':case['historical_source']}
            for path,value in oracle['changes'].items():
                combined=changed(combined,tuple(path.split('.')),value)
            check(historical_read_valid(combined['record'],row,combined['witness'],envelope,validator)
                  ==oracle['expected_valid'],event+': historical '+oracle['name'])
        for transport in case['transport_oracles']:
            candidate=transport['record']; source=transport.get('source')
            body=resolve_body(candidate,source)
            accepted=(envelope.is_valid(candidate) and joins(candidate,event,source)
                      and body is not None and validator.is_valid(body))
            check(accepted==transport['expected_valid'],event+': transport '+transport['name'])
        # Exact physical boundary independent of the family's maximum logical body.
        for size in [INLINE_LIMIT, INLINE_LIMIT+1]:
            probe={'probe':'x'*(size-10)}
            while len(body_bytes(probe)) != size:
                probe['probe']+='x' if len(body_bytes(probe))<size else ''
                if len(body_bytes(probe))>size: probe['probe']=probe['probe'][:-1]
            candidate=copy.deepcopy(record);candidate['payload']=probe
            check((resolve_body(candidate) is not None)==(size<=INLINE_LIMIT),event+': encoded inline boundary '+str(size))
        if 'test_source' in case:
            source=case['test_source']
            started_schema=json.loads((ROOT/'Plans/dch_event_payloads/chat_thread_worktree_pre_merge_test_started.schema.json').read_text())
            check(Draft202012Validator(started_schema,format_checker=FormatChecker()).is_valid(source['started']['payload'])
                  and envelope.is_valid(source['started']) and test_joins(record['payload'],source,event),event+': original test outcome join')
            for oracle in case['test_oracles']:
                combined={'payload':record['payload'],'source':source}
                for path,value in oracle['changes'].items():
                    combined=changed(combined,tuple(path.split('.')),value)
                check((validator.is_valid(combined['payload']) and test_joins(combined['payload'],combined['source'],event))
                      ==oracle['expected_valid'],event+': test outcome '+oracle['name'])
        if case['edition']=='application':
            invalid=copy.deepcopy(record);invalid['idempotency_key']='dch:'+identity(event,invalid['payload'])[len('evt_dch_'):]
            check(not joins(invalid,event),event+': reject incompatible application dch key')
            for key in ['server_id','operation_id']:
                changed_payload=copy.deepcopy(record['payload'])
                if key=='server_id': changed_payload['scope'][key]+=':other'
                else: changed_payload[key]+=':other'
                check(idempotency_key(event,changed_payload)!=record['idempotency_key'],event+': application original '+key)
        else:
            for oracle in case['partition_oracles']:
                if oracle['expected_valid']: continue
                # Keep envelope/identity internally consistent: the scope encoding alone must fail.
                invalid=copy.deepcopy(record);invalid['payload']['scope'].update(project_id=oracle['project_id'],scope_partition=oracle['scope_partition'])
                invalid['project_id']=oracle['project_id'];invalid['event_id']=identity(event,invalid['payload']);invalid['idempotency_key']=idempotency_key(event,invalid['payload'])
                check(not joins(invalid,event),event+': reject self-consistent wrong partition '+oracle['name'])
        if event=='chat.thread_archived':
            check(archive_joins(record['payload'],case['archive_source']),event+': archive original source joins')
            validator=Draft202012Validator(json.loads((ROOT/'Plans/dch_event_payloads/chat_thread_archived.schema.json').read_text()),format_checker=FormatChecker())
            for oracle in case['archive_oracles']:
                p=copy.deepcopy(record['payload']); source=copy.deepcopy(case['archive_source'])
                for path,value in oracle['changes'].items():
                    target={'payload':p,'source':source};parts=path.split('.')
                    for part in parts[:-1]: target=target[part]
                    target[parts[-1]]=value
                check((validator.is_valid(p) and archive_joins(p,source))==oracle['expected_valid'],event+': archive '+oracle['name'])
    for case in checkpoints:
        schema=json.loads((ROOT/case['schema_ref'].split('#')[0]).read_text())
        validator=Draft202012Validator(schema, format_checker=FormatChecker())
        row=next(r for r in contracts if r['event_type']==case['event_type'])
        check(validator.is_valid(case['valid']) and checkpoint_joins(case['valid'],case['source'],row,case['key']), case['event_type']+': checkpoint positive')
        entry=next(s for s in stored if s['value_schema_id']==schema['$id'])
        # Both real definitions, and both empty and populated histories, are
        # exercised independently even though preflight also requires equality.
        for kind, definition in [('selected',schema),('registered',entry['value_schema'])]:
            actual=Draft202012Validator(definition,format_checker=FormatChecker())
            for name,value in [('current',case['valid']),('populated history',case['with_history']),('maximum history',case['maximum_history'])]:
                check(actual.is_valid(value) and checkpoint_joins(value,case['source'],row,case['key']),
                      case['event_type']+': '+kind+' checkpoint '+name+' positive')
                trailing_lf_checks(value,definition,actual,case['event_type']+': '+kind+' checkpoint '+name)
        for name in case['negative_cases']:
            invalid=copy.deepcopy(case['valid'])
            if name=='persisted_redb_snapshot_id': invalid['source_token']['redb_snapshot_id']='forbidden'
            if name=='wrong_consumer': invalid['consumer_id']='sibling'
            if name=='wrong_projector': invalid['projector_id']='sibling'
            if name=='missing_source_token': del invalid['source_token']
            if name=='four_generations': invalid=copy.deepcopy(case['negative_values'][name])
            check(not validator.is_valid(invalid), case['event_type']+': '+name)
        for oracle in case['join_oracles']:
            combined={'value':case['valid'],'source':case['source'],'key':case['key']}
            for path,value in oracle['changes'].items():
                combined=changed(combined,tuple(path.split('.')),value)
            check((validator.is_valid(combined['value']) and checkpoint_joins(combined['value'],combined['source'],row,combined['key']))
                  ==oracle['expected_valid'],case['event_type']+': checkpoint join '+oracle['name'])
    # The same independent acceptance cases feed the guard-removal corpus.
    from types import SimpleNamespace
    from pm_dch_round5_oracles import cases as round5_cases, evaluate
    subject = SimpleNamespace(**globals())
    for oracle in round5_cases(subject):
        check(evaluate(subject, oracle, envelope) == oracle.expected, oracle.name.split('/')[0]+': '+oracle.name)
    from pm_dch_round6_oracles import cases as round6_cases, evaluate as evaluate6
    for oracle in round6_cases(subject):
        check(evaluate6(subject, oracle, envelope) == oracle.expected, oracle.name.split('/')[0]+': '+oracle.name)
    from pm_dch_round7_oracles import cases as round7_cases, evaluate as evaluate7
    for oracle in round7_cases(subject):
        check(evaluate7(subject, oracle, envelope) == oracle.expected, oracle.name.split('/')[0]+': '+oracle.name)
    from pm_dch_round8_oracles import cases as round8_cases, evaluate as evaluate8
    for oracle in round8_cases(subject):
        check(evaluate8(subject, oracle, envelope) == oracle.expected, oracle.name.split('/')[0]+': '+oracle.name)
    return finish()

if __name__=='__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--family', help='Run one complete family, both editions and its checkpoint, serially.')
    SELECTED_FAMILY = parser.parse_args().family
    sys.exit(main())
