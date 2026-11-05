#!/usr/bin/env python3
"""Static DMEM contract model. Synthetic custody/transactions; native NOT_RUN."""
from copy import deepcopy
from decimal import Decimal
from functools import lru_cache
from pathlib import Path
import base64
import hashlib
import importlib.util
import json
import math
import argparse
import datetime
import re
from urllib.parse import urljoin
from jsonschema import Draft202012Validator, FormatChecker
from referencing import Registry
from referencing.exceptions import Unresolvable
import referencing.jsonschema as _REFERENCING_SPECS

ROOT = Path(__file__).resolve().parents[1]
OP_NAMES = ('dedup_sweep', 'index_lexical_rebuild', 'index_semantic_rebuild', 'verification_sweep')
# Every schema document this checker validates against; each is reference-checked before any instance validation.
SCHEMA_DOCUMENTS = ('Plans/memory_maintenance_event_payloads.schema.json', 'Plans/memory_maintenance_operation.schema.json',
                    'Plans/memory_maintenance_rebuild_target.schema.json', 'Plans/event_record.schema.json',
                    'Plans/event_record_index_checkpoint.schema.json', 'Plans/memory_maintenance_event_record.schema.json')
SAFE_INTEGER = 2**53 - 1
REGISTRY_DOCUMENT = 'Plans/storage_value_registry.json'
_CODEC_SPEC = importlib.util.spec_from_file_location('_dmem_binding_codec', ROOT / 'scripts/pm_event_index_binding.py')
_CODEC = importlib.util.module_from_spec(_CODEC_SPEC)
_CODEC_SPEC.loader.exec_module(_CODEC)


_PURE_RESULTS = {}


def pure(function):
    """Memoize a deterministic predicate by the exact JSON of its arguments (types stay distinct)."""
    def wrapped(*args):
        try:
            key = (function.__name__, json.dumps(args, sort_keys=True, ensure_ascii=False))
        except (TypeError, ValueError):
            return function(*args)  # a non-JSON input is evaluated directly, never cached
        if key not in _PURE_RESULTS:
            _PURE_RESULTS[key] = function(*args)
        return _PURE_RESULTS[key]
    wrapped.__name__ = function.__name__
    return wrapped


@pure
def within_value_cap(value, historical=False):
    normalize = historical_numbers if historical else canonical_numbers
    return len(_CODEC.binding_bytes(normalize(value))) <= 16384



def load(path):
    return json_numbers((ROOT / path).read_text())


def json_numbers(text):
    """Decode decimal/exponent tokens exactly, before any binary64 conversion.

    Preserve invalid fractions as Decimal so validators/hash guards can refuse them. Schema bounds
    and negative fixtures may themselves contain out-of-domain integers; loading is not admission.
    """
    def exact(token):
        value = Decimal(token)
        return int(value) if value.is_finite() and value == value.to_integral_value() else value
    return json.loads(text, parse_float=exact, parse_constant=exact)


def canonical_numbers(value):
    """One JSON number spelling for this integer-only contract, including -0 and integral exponents.

    JSON Schema's integer accepts 1.0. Normalize that mathematical integer before every hash;
    nonintegral/nonfinite numbers have no representation in these maintenance recipes.
    """
    if type(value) in (int, float, Decimal):
        finite = value.is_finite() if isinstance(value, Decimal) else (True if type(value) is int else math.isfinite(value))
        if not finite or abs(value) > SAFE_INTEGER or value != int(value):
            raise ValueError('non_integer_commitment_number')
        return int(value) if finite else float(value)
    if isinstance(value, dict):
        return {key: canonical_numbers(item) for key, item in value.items()}
    if isinstance(value, (list, tuple)):
        return [canonical_numbers(item) for item in value]
    return value


def numbers_supported(value):
    try:
        canonical_numbers(value)
    except ValueError:
        return False
    return True


def digest(value):
    return hashlib.sha256(json.dumps(canonical_numbers(value), ensure_ascii=False, sort_keys=True,
                                    separators=(',', ':')).encode('utf-8')).hexdigest()


def historical_numbers(value):
    """Frozen integer-json-v1 encoding: integral values have no safe-integer upper bound.

    Both retained envelope editions use this same encoding. Current writes are its strict subset,
    with identical bytes on that subset; no caller-controlled recipe selector or fallback exists.
    Lossless Decimal ingestion preserves integers before encoding, including uint64 boundaries.
    """
    if type(value) in (int, float, Decimal):
        finite = value.is_finite() if isinstance(value, Decimal) else (True if type(value) is int else math.isfinite(value))
        if not finite or value != int(value):
            raise ValueError('non_integer_commitment_number')
        return int(value)
    if isinstance(value, dict):
        return {key: historical_numbers(item) for key, item in value.items()}
    if isinstance(value, (list, tuple)):
        return [historical_numbers(item) for item in value]
    return value


def historical_digest(value):
    return hashlib.sha256(json.dumps(historical_numbers(value), ensure_ascii=False, sort_keys=True,
                                    separators=(',', ':')).encode('utf-8')).hexdigest()


def decode_json_number(literal):
    return json_numbers(literal)


def parse_json_number(literal):
    return canonical_numbers(decode_json_number(literal))


def flag(value, expected):
    """Authority/fence fields accept the exact Boolean type before evaluating its value."""
    return type(value) is bool and value is expected


def identity(event_type, instance, project, operation):
    h = digest(['pm.memory.maintenance.event.v1', instance, project, operation, event_type])
    return 'evt_mem_' + h, 'memory-maintenance:' + h


def operation_name(event):
    return event.removeprefix('memory.').rsplit('.', 1)[0].replace('.', '_')


def result_ref(row):
    return 'memresult_' + digest(['pm.memory.maintenance.result_ref.v1', row['storage_instance_id'],
                                  row['project_id'], row['operation_id']])


def event_type(row, phase):
    commands = {'cmd.chat.memory.dedup_sweep': 'dedup_sweep',
                'cmd.chat.memory.rebuild_lexical_index': 'index.lexical.rebuild',
                'cmd.chat.memory.rebuild_semantic_index': 'index.semantic.rebuild',
                'cmd.chat.memory.verification_sweep': 'verification_sweep'}
    return 'memory.' + commands[row['command_id']] + '.' + phase


# Standing check 9: every $ref in every applicator branch resolves, whether or not a fixture visits it.
SCHEMA_KEYWORDS = {'additionalProperties', 'items', 'contains', 'propertyNames', 'not', 'if', 'then', 'else',
                   'unevaluatedItems', 'unevaluatedProperties', 'contentSchema', 'additionalItems'}
SCHEMA_ARRAY_KEYWORDS = {'allOf', 'anyOf', 'oneOf', 'prefixItems'}
SCHEMA_MAP_KEYWORDS = {'properties', 'patternProperties', 'dependentSchemas', '$defs', 'definitions'}
DATA_KEYWORDS = {'const', 'enum', 'default', 'examples'}
REFERENCE_KEYWORDS = ('$ref', '$dynamicRef')


def document_uri(path, doc):
    return doc['$id'] if isinstance(doc, dict) and isinstance(doc.get('$id'), str) else 'urn:pm-dmem:' + path


def schema_registry(documents):
    """Offline registry of exactly these documents: an unknown document is unresolvable, never retrieved."""
    registry = Registry()
    for path, doc in documents.items():
        # The registry data file declares its own $schema; every walked schema here is Draft 2020-12.
        registry = registry.with_resource(document_uri(path, doc), _REFERENCING_SPECS.DRAFT202012.create_resource(doc))
    return registry.crawl()


def unresolved_references(documents, roots=None):
    """Walk every subschema (base URI follows nested $id) and resolve every reference; return the failures."""
    registry = schema_registry(documents); failures = []

    def schema(node, base, where):
        if not isinstance(node, dict):
            if not isinstance(node, bool):
                failures.append({'location': where, 'error': 'not_a_schema'})
            return
        if '$id' in node:
            if not isinstance(node['$id'], str):
                failures.append({'location': where + '/$id', 'error': 'non_string_id'}); return
            base = urljoin(base, node['$id'])
        for key in REFERENCE_KEYWORDS:
            if key in node:
                ref = node[key]
                try:
                    if not isinstance(ref, str):
                        raise Unresolvable(ref=repr(ref))
                    registry.resolver(base_uri=base).lookup(ref)
                except Unresolvable as error:
                    failures.append({'location': where + '/' + key, 'ref': ref, 'base': base,
                                     'error': type(error).__name__})
        for key, value in node.items():
            here = where + '/' + key
            if key in DATA_KEYWORDS or key in REFERENCE_KEYWORDS or key == '$id':
                continue
            if key in SCHEMA_KEYWORDS:
                schema(value, base, here)
            elif key in SCHEMA_ARRAY_KEYWORDS:
                if not isinstance(value, list):
                    failures.append({'location': here, 'error': 'not_a_schema_array'}); continue
                for i, item in enumerate(value):
                    schema(item, base, here + '/' + str(i))
            elif key in SCHEMA_MAP_KEYWORDS:
                if not isinstance(value, dict):
                    failures.append({'location': here, 'error': 'not_a_schema_map'}); continue
                for name, item in value.items():
                    schema(item, base, here + '/' + name)
            else:
                unknown(value, base, here)

    def unknown(value, base, where):
        # Unknown/annotation keywords fail closed: any nested object is walked as a possible schema.
        if isinstance(value, dict):
            schema(value, base, where)
        elif isinstance(value, list):
            for i, item in enumerate(value):
                unknown(item, base, where + '/' + str(i))

    for path, doc in documents.items():
        for pointer, node in (roots or {}).get(path, [('', doc)]):
            schema(node, document_uri(path, doc), path + '#' + pointer)
    return failures


def checked_documents():
    return {path: load(path) for path in SCHEMA_DOCUMENTS}


def require_resolved_references():
    documents = checked_documents()
    failures = unresolved_references(documents)
    # The registry mirrors are separate documents: a local reference there must resolve in the registry itself.
    registry = load(REGISTRY_DOCUMENT)
    roots = {REGISTRY_DOCUMENT: [('/families/' + str(i) + '/value_schema', v['value_schema'])
                                 for i, v in enumerate(registry['families']) if v['family_id'] in own_value_ids()]}
    failures += unresolved_references({**documents, REGISTRY_DOCUMENT: registry}, roots={
        **{path: [] for path in documents}, **roots})
    assert not failures, ('unresolved_schema_reference', failures)
    return len(roots[REGISTRY_DOCUMENT])


def own_value_ids():
    return ['memory_' + n + '_operation' for n in OP_NAMES] + ['memory_index_lexical_selector',
                                                               'memory_index_semantic_selector']


@lru_cache(maxsize=1)
def checked_registry():
    return schema_registry(checked_documents())


def enforced_formats():
    """Do not depend on jsonschema's optional date-time/URI dependency packages being installed.

    This is the existing RFC3339 contract: explicit zone, real calendar fields, optional nonempty
    fractional seconds; leap seconds are unsupported. Timestamp strings are never normalized for
    hashing. UUID is a full 8-4-4-4-12 hexadecimal spelling. Schema types remain separate guards.
    """
    checker = FormatChecker()
    @checker.checks('date-time')
    def date_time(value):
        if not isinstance(value, str):
            return True
        match = re.fullmatch(r'([0-9]{4})-([0-9]{2})-([0-9]{2})[Tt]([0-9]{2}):([0-9]{2}):([0-9]{2})(?:\.[0-9]+)?([Zz]|[+-][0-9]{2}:[0-9]{2})', value)
        if match is None:
            return False
        try:
            datetime.datetime(*(int(v) for v in match.groups()[:6]))
        except ValueError:
            return False
        zone = match.group(7)
        return zone in ('Z', 'z') or int(zone[1:3]) <= 23 and int(zone[4:6]) <= 59
    @checker.checks('uuid')
    def uuid(value):
        return not isinstance(value, str) or re.fullmatch(r'[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}', value) is not None
    return checker


@lru_cache(maxsize=None)
def validator(path, definition):
    # Select the definition inside its own document so every reference keeps the document's base URI.
    doc = load(path)
    if not definition.startswith('/') and definition not in doc['$defs']:
        raise KeyError(definition)
    pointer = definition if definition.startswith('/') else '/$defs/' + definition
    return Draft202012Validator({'$ref': document_uri(path, doc) + '#' + pointer},
                                registry=checked_registry(), format_checker=enforced_formats())


def formatted_value_matches(path, pointer, value):
    return validator(path, pointer).is_valid(value)


def target_schema_matches(target, kind, historical=False):
    return validator('Plans/memory_maintenance_rebuild_target.schema.json',
                     ('historical_' if historical else '') + kind + '_target').is_valid(target)


def target_order_matches(target):
    names = [x['relative_name'] for x in target['artifacts']]
    return names == sorted(set(names))


def target_manifest_matches(target, historical=False):
    return target['manifest_sha256'] == (historical_digest if historical else digest)(target['artifacts'])


def target_source_matches(target, row):
    return target['source_revision_sha256'] == row['source_revision_sha256']


def target_identity_matches(target, row, kind):
    h = digest(['pm.memory.maintenance.target.v1', row['storage_instance_id'], row['project_id'],
                row['operation_id'], kind, row['source_revision_sha256'], target['manifest_sha256']])
    return target['target_id'] == 'memtarget_' + h


@pure
def valid_target(target, row, historical=False):
    kind = 'lexical' if 'lexical' in row['command_id'] else 'semantic'
    return (target_schema_matches(target, kind, historical) and target_order_matches(target)
            and target_manifest_matches(target, historical) and target_source_matches(target, row)
            and target_identity_matches(target, row, kind))


def selector_schema_matches(value, kind):
    return validator('Plans/memory_maintenance_rebuild_target.schema.json', kind + '_selector').is_valid(value)


def selector_scope_matches(value, row):
    return all(value[k] == row[k] for k in ('storage_instance_id', 'project_id'))


@pure
def valid_selector(value, row):
    if value is None:
        return True
    kind = 'lexical' if 'lexical' in row['command_id'] else 'semantic'
    if not selector_schema_matches(value, kind) or not within_value_cap(value):
        return False
    if not selector_scope_matches(value, row):
        return False
    source = {**row, 'operation_id': value['operation_id'],
              'source_revision_sha256': value['target']['source_revision_sha256']}
    return valid_target(value['target'], source)


def result_digest(row):
    target = row.get('prepared_target')
    return digest(['pm.memory.maintenance.result.v1', row['storage_instance_id'], row['project_id'],
                   row['operation_id'], row['command_id'], row['source_revision_sha256'], row['status'],
                   target['target_id'] if target else None])


def operation_schema_matches(row, name, historical=False):
    return validator('Plans/memory_maintenance_operation.schema.json',
                     ('historical_' if historical else '') + name).is_valid(row)


def operation_receipts_match(row):
    return all(row[field] is None or row[field] == identity(event_type(row, suffix), row['storage_instance_id'],
                                                          row['project_id'], row['operation_id'])[0]
               for suffix, field in [('started', 'started_event_id'), ('completed', 'completed_event_id')])


def operation_result_ref_matches(row):
    return row['result_ref'] == result_ref(row)


def operation_result_digest_matches(row):
    return row['result_sha256'] == result_digest(row)


@pure
def valid_operation(row, name, historical=False):
    if not operation_schema_matches(row, name, historical) or not within_value_cap(row, historical):
        return False
    if not operation_receipts_match(row):
        return False
    if row.get('prepared_target') is not None and not valid_target(row['prepared_target'], row, historical):
        return False
    if row['phase'] == 'prepared':
        # Reserve terminal custody before swapping: success must still fit after both receipt ids and outcome exist.
        terminal = {**row, 'phase': 'completed', 'status': 'succeeded',
                    'completed_occurred_at_utc': '0' * 64, 'result_ref': result_ref(row),
                    'result_sha256': '0' * 64,
                    'completed_event_id': identity(event_type(row, 'completed'), row['storage_instance_id'],
                                                   row['project_id'], row['operation_id'])[0]}
        if not within_value_cap(terminal, historical):
            return False

    if row['status'] is not None:
        if not operation_result_ref_matches(row) or not operation_result_digest_matches(row):
            return False
    return True


def payload_from(row, suffix):
    payload = {k: row[k] for k in ('project_id', 'operation_id', 'source_revision_sha256', 'command_id')}
    payload.update(schema_version='1.0.0', event_type=event_type(row, suffix),
                   occurred_at_utc=row[suffix + '_occurred_at_utc'])
    if suffix == 'completed':
        payload.update({k: row[k] for k in ('started_event_id', 'status', 'result_ref', 'result_sha256')})
    return payload


def full_value(row, suffix):
    event = event_type(row, suffix)
    event_id, key = identity(event, row['storage_instance_id'], row['project_id'], row['operation_id'])
    # Reduced phase-model value; the independent writer suite below checks canonical EventRecord boundaries.
    return {'event_id': event_id, 'event_type': event, 'idempotency_key': key,
            'scope_kind': 'project', 'project_id': row['project_id'], 'correlation_id': row['operation_id'],
            'causation_event_id': row['started_event_id'] if suffix == 'completed' else None,
            'payload_ref': None, 'payload': payload_from(row, suffix)}


def scope_partition(project):
    return 'project~' + base64.urlsafe_b64encode(project.encode('utf-8')).decode('ascii').rstrip('=')


def canonical_value(row, suffix):
    """Synthetic complete EventRecord, not a physical receipt or storage clock allocator."""
    value = full_value(row, suffix)
    value.update(schema_id='pm.event.v0', schema_version='2.0.0',
                 thread_id=None, run_id=None, node_id=None, attempt_id=None,
                 actor_ref='component:MemoryMaintenance', requested_account_ref=None,
                 effective_account_ref=None, occurred_at_utc=row[suffix + '_occurred_at_utc'],
                 observed_at_utc=row[suffix + '_occurred_at_utc'],
                 persisted_at_utc=row[suffix + '_occurred_at_utc'],
                 sequence_id=1 if suffix == 'started' else 2, producer_sequence_id=None,
                 parent_event_id=None,
                 payload_schema_id=load('Plans/memory_maintenance_event_payloads.schema.json')['$id']
                 + '#/$defs/' + value['event_type'].replace('.', '_'),
                 redaction_profile='no_secrets', replay_policy='dedupe_by_idempotency_key',
                 migration={k: None for k in ('migrated_from_schema_id', 'migrated_from_schema_version',
                                              'migration_id', 'compatibility_event_type')})
    return value


@lru_cache(maxsize=1)
def envelope_validator():
    return validator('Plans/memory_maintenance_event_record.schema.json', 'current')


STORAGE_FIELDS = frozenset({'sequence_id', 'observed_at_utc', 'persisted_at_utc'})
# SP-236 owns these exact uint64 metadata fields, independently of producer semantics (Contracts EventRecord section 1.2).
STORAGE_UINT64_FIELDS = ('sequence_id',)


def storage_uint64_types(value):
    return all(field not in value or type(value[field]) is int for field in STORAGE_UINT64_FIELDS)



def lawful_phases(row):
    if row['command_id'] in ('cmd.chat.memory.rebuild_lexical_index', 'cmd.chat.memory.rebuild_semantic_index'):
        return ('accepted', 'started', 'prepared', 'effect_committed', 'completed')
    return ('accepted', 'started', 'effect_committed', 'completed')


def start_custody_gate(state, first_start=False, writer_event=None, canonical_history=False):
    """The one start-custody rule of SP-630 to SP-637, adopting SP-286/CV-339 retained full-value originals.

    Every path except first start admission must resolve and verify the exact original start record before it
    appends, CAS-publishes a row or selector, settles an effect, or returns or discloses an original. First
    start admission may lack the record only on an accepted row with no start receipt and no later original;
    any record that is present is verified even there. Refusal is start_receipt_missing, or
    permission_or_withdrawal under a withdrawal fence; the caller publishes nothing.
    """
    require(flag(state['withdrawn'], False), 'permission_or_withdrawal')
    row = state['operation']
    started = event_type(row, 'started'); completed = event_type(row, 'completed')
    expected = (canonical_value if canonical_history else full_value)(row, 'started'); start_id = expected['event_id']
    record = state['originals'].get(started)
    canonical = state.get('original') if writer_event == started else None
    terminal = state.get('original') if writer_event == completed else None
    later = [x.get('full_value') if isinstance(x, dict) else None
             for x in (state['originals'].get(completed), terminal) if x is not None]
    receipt_recorded = row['phase'] != 'accepted' or row['started_event_id'] is not None
    # Phase and receipt: only an accepted row lacks a start receipt; every later row names exactly this start.
    require(row['phase'] in lawful_phases(row), 'start_receipt_missing')
    require(row['started_event_id'] == (None if row['phase'] == 'accepted' else start_id), 'start_receipt_missing')
    if receipt_recorded or later:
        require(record is not None, 'start_receipt_missing')
        # The started writer's own retained canonical original is the same start record; it must survive too.
        require(writer_event != started or canonical is not None, 'start_receipt_missing')
    elif not first_start:
        require(record is not None or canonical is not None, 'start_receipt_missing')
    if record is not None:
        # Exact retained value, full-flush settled receipt, digest, identity, operation, event type and payload.
        require((historical_matches if canonical_history else original_matches)(record, expected), 'start_receipt_missing')
    if canonical is not None:
        value = canonical.get('full_value') if isinstance(canonical, dict) else None
        reference = canonical_value(row, 'started')
        require(original_matches(canonical, value) and historical_envelope_matches(value)
                and retained_binding({k: value[k] for k in set(reference) - STORAGE_FIELDS},
                                     {k: reference[k] for k in set(reference) - STORAGE_FIELDS})
                and retained_binding({k: value[k] for k in expected}, expected), 'start_receipt_missing')
    for value in later:
        # Every later retained original of this operation cites exactly this start record.
        require(isinstance(value, dict) and value.get('causation_event_id') == start_id
                and isinstance(value.get('payload'), dict)
                and value['payload'].get('started_event_id') == start_id, 'start_receipt_missing')


def append_current(before, value, event):
    """Independent current-writer boundary; append/retry never executes a maintenance effect."""
    suffix = event.rsplit('.', 1)[1]
    state, output = _append_current(before, value, event)
    # Commit point: no append or original return escapes the start custody gate, before or after.
    start_custody_gate(before, first_start=suffix == 'started', writer_event=event)
    start_custody_gate(state, writer_event=event)
    return state, output


def _append_current(before, value, event):
    state = deepcopy(before); row = state['operation']
    require(storage_uint64_types(value), 'invalid_storage_uint64')
    require(numbers_supported({k: v for k, v in value.items() if k not in STORAGE_FIELDS}), 'invalid_number')
    require(envelope_validator().is_valid(value), 'invalid_event_record')
    require(value['replay_policy'] != 'projector_replay_only', 'replay_only_not_appendable')
    require(value['replay_policy'] == 'dedupe_by_idempotency_key', 'replay_policy_mismatch')
    require(flag(state['admitted'], True), 'not_admitted')
    require(flag(state['permission'], True) and flag(state['withdrawn'], False), 'permission_or_withdrawal')
    # Returning a verified original reads its existing operation edition; new append admission
    # still applies the current operation schema. An original is never returned before custody.
    require(valid_operation(row, operation_name(event), state['original'] is not None), 'invalid_operation')
    suffix = event.rsplit('.', 1)[1]
    expected = canonical_value(row, suffix)
    # Validate dispatch and all producer-owned joins separately from Storage's three assigned fields.
    producer_fields = set(expected) - STORAGE_FIELDS
    same_identity = (value['event_id'], value['idempotency_key']) == (expected['event_id'], expected['idempotency_key'])
    require(all(value[k] == expected[k] for k in producer_fields),
            'idempotency_conflict' if state['original'] is not None and same_identity else 'envelope_join')
    require(validator('Plans/memory_maintenance_event_payloads.schema.json',
                      event.replace('.', '_')).is_valid(value['payload']), 'invalid_payload')
    require(len(_CODEC.binding_bytes(canonical_numbers(value['payload']))) <= 16384, 'inline_payload_too_large')
    key = [scope_partition(row['project_id']), event, value['idempotency_key']]
    require(state['dedupe_key'] == key, 'scope_partition_mismatch')
    # The one start custody gate; terminal and start retries disclose an original, so it precedes that return.
    start_custody_gate(state, first_start=suffix == 'started', writer_event=event)
    if state['original'] is not None:
        original = state['original']['full_value']
        require(original_matches(state['original'], original) and historical_envelope_matches(original)
                and retained_binding({k: original[k] for k in producer_fields},
                                     {k: value[k] for k in producer_fields}), 'original_value_changed')
        return state, deepcopy(original)
    require(row['phase'] == ('accepted' if suffix == 'started' else 'effect_committed'), 'wrong_phase')
    state['original'] = retained(value)
    state['append_count'] += 1
    return state, deepcopy(value)


def retained(value):
    # Reuse the existing integral record encoding, which already preserves exact uint64 metadata.
    # Producer-only numeric admission happens at the writer; no current cap reaches Storage fields.
    return {'full_value': deepcopy(value), 'full_value_sha256': historical_digest(value), 'durability': 'full_flush'}


def retained_shape(original):
    return isinstance(original, dict) and set(original) == {'full_value', 'full_value_sha256', 'durability'}


def retained_flush(original):
    return original['durability'] == 'full_flush'


def retained_digest(original, historical=True):
    return original['full_value_sha256'] == (historical_digest if historical else digest)(original['full_value'])


def retained_binding(value, expected):
    return value == expected


def original_matches(original, value):
    # Equivalent conjunction: after equality holds, self-digest and expected-value digest are identical.
    # Separate predicates let check 11 remove integrity without also removing the operation/value join.
    return (retained_shape(original) and retained_flush(original)
            and retained_binding(original['full_value'], value) and retained_digest(original, True))


def accept(payload, contract, context):
    """Validate a candidate against concrete custody as well as the original boundary checks."""
    try:
        event = contract['event_type']; name = operation_name(event)
        if not validator('Plans/memory_maintenance_event_payloads.schema.json', event.replace('.', '_')).is_valid(payload):
            return False
        if not payload['occurred_at_utc'].endswith('Z'):
            return False
        if not flag(context['admitted'], True) or not flag(context['withdrawn'], False) or not flag(context['permission'], True):
            return False
        if any(payload[k] != context[k] for k in ('project_id', 'operation_id', 'source_revision_sha256')):
            return False
        if not flag(context['request_matches'], True) or not flag(context['current_source'], True):
            return False
        row = context['operation']
        if not valid_operation(row, name) or row['request_sha256'] != context['request_sha256']:
            return False
        suffix = event.rsplit('.', 1)[1]
        if payload != payload_from(row, suffix):
            return False
        originals = context['originals']
        if suffix == 'completed':
            if not (flag(context['started_receipt'], True) and flag(context['effect_settled'], True) and flag(context['original_full_value'], True)):
                return False
            if row['phase'] not in ('effect_committed', 'completed') or payload['started_event_id'] != context['started_event_id']:
                return False
        elif not flag(context['acceptance_durable'], True):
            return False
        # The same start custody gate as every writer, recovery, retry, replay and history path.
        start_custody_gate({'operation': row, 'originals': originals, 'withdrawn': context['withdrawn']},
                           first_start=suffix == 'started')
        original = originals.get(event)
        if original is not None and not original_matches(original, full_value(row, suffix)):
            return False
        if row['phase'] == 'completed' and suffix == 'completed' and original is None:
            return False
        return True
    except (KeyError, TypeError, ValueError):
        return False


class Refusal(ValueError):
    pass


def require(test, reason):
    if not test:
        raise Refusal(reason)


def selected_value(row):
    kind = row['prepared_target']['index_kind']
    return {'schema_id': 'pm.storage_value.memory_index_' + kind + '_selector.v1',
            'schema_version': '1.0.0', 'storage_instance_id': row['storage_instance_id'],
            'project_id': row['project_id'], 'operation_id': row['operation_id'],
            'target': deepcopy(row['prepared_target'])}


def custody(state, suffix):
    row = state['operation']
    return original_matches(state['originals'].get(event_type(row, suffix)), full_value(row, suffix))


def effect_fences(state):
    row = state['operation']
    require(flag(state['permission'], True) and flag(state['withdrawn'], False), 'permission_or_withdrawal')
    require(row['source_revision_sha256'] == state['current_source_revision_sha256'], 'source_changed')
    start_custody_gate(state)


def target_fences(state):
    row = state['operation']; target = row.get('prepared_target')
    require(target is not None and valid_target(target, row), 'target_invalid')
    require(state['durable_artifacts'] == target['artifacts'], 'artifact_mismatch')
    effect_fences(state)


def transition(before, action):
    """An atomic static transition. A refusal publishes none of the tentative state."""
    state, output = _transition(before, action)
    if action['op'] != 'crash':
        # Commit point of every path: no append, row/selector CAS, effect or original return escapes the gate.
        # crash only drops volatile publication state; it appends, publishes and returns nothing.
        start_custody_gate(before, first_start=action['op'] == 'append_started')
        start_custody_gate(state)
    return state, output


def _transition(before, action):
    state = deepcopy(before); row = state['operation']; op = action['op']; output = None
    name = operation_name(event_type(row, 'started'))
    if op != 'crash':
        require(flag(state['permission'], True) and flag(state['withdrawn'], False), 'permission_or_withdrawal')
    require(valid_operation(row, name), 'invalid_operation')
    require(row['request_sha256'] == state['request_sha256'], 'request_changed')
    if name.startswith('index_'):
        require(valid_selector(state['selector'], row), 'invalid_selector')
    if op in ('advance_started', 'prepare', 'swap', 'settle', 'advance_completed'):
        require(action['expected_operation'] == row, 'operation_cas_conflict')
    if op in ('append_started', 'append_completed'):
        suffix = op.removeprefix('append_')
        require(flag(state['permission'], True) and flag(state['withdrawn'], False), 'permission_or_withdrawal')
        require(row['phase'] == ('accepted' if suffix == 'started' else 'effect_committed'), 'wrong_phase')
        start_custody_gate(state, first_start=suffix == 'started')
        value = full_value(row, suffix)
        require(action['value'] == value, 'original_value_changed')
        event = event_type(row, suffix)
        if event in state['originals']:
            require(original_matches(state['originals'][event], value), 'original_value_changed')
        else:
            state['originals'][event] = retained(value)
        state['volatile'] = {'response': deepcopy(value)}
        output = value
    elif op == 'advance_started':
        require(row['phase'] == 'accepted', 'start_receipt_missing')
        start_custody_gate(state)
        row.update(phase='started', started_event_id=full_value(row, 'started')['event_id'])
    elif op == 'prepare':
        require(row['phase'] == 'started' and name.startswith('index_'), 'wrong_phase')
        effect_fences(state)
        target = action['target']
        require(valid_target(target, row) and state['durable_artifacts'] == target['artifacts'], 'target_invalid')
        prior = digest(state['selector']) if state['selector'] is not None else None
        require(target['prior_selector_sha256'] == prior, 'prior_selector_mismatch')
        row.update(phase='prepared', prepared_target=deepcopy(target))
    elif op == 'swap':
        require(row['phase'] == 'prepared', 'wrong_phase')
        target_fences(state)
        prior = digest(state['selector']) if state['selector'] is not None else None
        require(prior == row['prepared_target']['prior_selector_sha256'], 'selector_cas_conflict')
        require(state['effect_count'] == 0 and state['swap_count'] == 0, 'repeated_effect')
        state['selector'] = selected_value(row)
        state['effect_count'] += 1; state['swap_count'] += 1
    elif op == 'settle':
        require(row['phase'] in ('started', 'prepared'), 'wrong_phase')
        start_custody_gate(state)
        require(action['status'] in ('succeeded', 'failed'), 'outcome_invalid')
        if name.startswith('index_'):
            if action['status'] == 'succeeded':
                target_fences(state)
                require(state['selector'] == selected_value(row), 'selected_target_mismatch')
                require(state['effect_count'] == state['swap_count'] == 1, 'effect_count_mismatch')
            else:
                require(state['effect_count'] == state['swap_count'] == 0, 'committed_effect_cannot_fail')
        elif action['status'] == 'succeeded':
            effect_fences(state)
            require(state['effect_count'] == 0, 'repeated_effect')
            state['effect_count'] = 1
        else:
            require(state['effect_count'] == 0, 'committed_effect_cannot_fail')
        row.update(phase='effect_committed', status=action['status'],
                   completed_occurred_at_utc=action['completed_occurred_at_utc'], result_ref=result_ref(row))
        row['result_sha256'] = result_digest(row)
    elif op == 'advance_completed':
        require(row['phase'] == 'effect_committed' and custody(state, 'completed'), 'terminal_receipt_missing')
        start_custody_gate(state)
        row.update(phase='completed', completed_event_id=full_value(row, 'completed')['event_id'])
    elif op in ('retry', 'replay'):
        require(flag(state['permission'], True) and flag(state['withdrawn'], False), 'permission_or_withdrawal')
        suffix = action['event_type'].rsplit('.', 1)[1]
        require(action['event_type'] == event_type(row, suffix) and custody(state, suffix), 'original_missing')
        start_custody_gate(state)
        output = deepcopy(state['originals'][action['event_type']]['full_value'])
        require(retained_binding(action['value'], output), 'original_value_changed')
    elif op == 'crash':
        state['volatile'] = None
    elif op == 'recover':
        # Restart uses only durable originals and the frozen selected target, never a replacement candidate.
        require(flag(state['permission'], True) and flag(state['withdrawn'], False), 'permission_or_withdrawal')
        start_custody_gate(state)
        if row['phase'] == 'accepted':
            state, _ = transition(state, {'op': 'advance_started', 'expected_operation': deepcopy(row)})
        elif row['phase'] == 'prepared':
            target_fences(state)
            if state['selector'] != selected_value(row):
                state, _ = transition(state, {'op': 'swap', 'expected_operation': deepcopy(row)})
            state, _ = transition(state, {'op': 'settle', 'expected_operation': deepcopy(state['operation']),
                                         'status': 'succeeded', 'completed_occurred_at_utc': action['completed_occurred_at_utc']})
        elif row['phase'] == 'effect_committed':
            state, _ = transition(state, {'op': 'append_completed', 'value': full_value(row, 'completed')})
            state, _ = transition(state, {'op': 'advance_completed', 'expected_operation': deepcopy(state['operation'])})
        elif row['phase'] == 'completed':
            require(custody(state, 'completed'), 'terminal_receipt_missing')
            output = deepcopy(state['originals'][event_type(row, 'completed')]['full_value'])
        # started with no committed effect remains pending; no outcome is guessed.
    else:
        raise Refusal('unknown_action')
    require(valid_operation(state['operation'], name), 'invalid_operation_after')
    return state, output


def read_history(before, event):
    """Stateless history reader: a retained original verified when written is returned whatever the operation's
    current live state (later phase, source revision, selector, counters, request); it still refuses a withdrawal
    fence, revoked access, a forged or missing original and missing start custody. It changes no state."""
    state = before; row = state['operation']
    require(flag(state['permission'], True) and flag(state['withdrawn'], False), 'permission_or_withdrawal')
    require(valid_operation(row, operation_name(event_type(row, 'started')), True), 'invalid_operation')
    suffix = event.rsplit('.', 1)[1] if event.count('.') >= 2 else ''
    require(suffix in ('started', 'completed') and event == event_type(row, suffix), 'unknown_event')
    start_custody_gate(state)
    require(custody(state, suffix), 'original_missing')
    return deepcopy(state['originals'][event]['full_value'])


# Frozen recipe selection is by the closed envelope edition, not an untrusted recipe field.
# The two editions deliberately share one numeric/hash recipe, so changing edition cannot select
# weaker number validation. Their separate envelope constraints still apply in full.
HISTORY_RECIPES = {('pm.event.v0', '1.0.0'): 'compatibility',
                   ('pm.event.v0', '2.0.0'): 'historical_current'}


def historical_envelope_matches(value):
    if not isinstance(value, dict):
        return False
    try:
        historical_numbers(value)
    except ValueError:
        return False
    edition = (value.get('schema_id'), value.get('schema_version'))
    definition = HISTORY_RECIPES.get(edition, 'historical_current') if all(type(v) is str for v in edition) else 'historical_current'
    # Unknown editions are tested against the closed 2.0.0 schema, which rejects their constants;
    # this is not a permissive recipe fallback. Both known editions use the same hash encoding.
    return validator('Plans/memory_maintenance_event_record.schema.json', definition).is_valid(value)


def historical_payload_matches(value, expected):
    return validator('Plans/memory_maintenance_event_payloads.schema.json',
                     expected['event_type'].replace('.', '_')).is_valid(value.get('payload'))


def historical_binding(value, expected):
    """Semantic joins only. Closed schemas independently own presence, shape and allowed policies."""
    reference = deepcopy(expected)
    if value.get('schema_version') == '1.0.0':
        reference['schema_version'] = '1.0.0'
        del reference['scope_kind']
    fields = set(reference) & set(value) - STORAGE_FIELDS - {'payload', 'replay_policy', 'migration', 'actor_ref'}
    if not retained_binding({key: value[key] for key in fields}, {key: reference[key] for key in fields}):
        return False
    payload = value.get('payload')
    return (isinstance(payload, dict) and retained_binding(
        {key: payload[key] for key in set(payload) & set(reference['payload'])},
        {key: reference['payload'][key] for key in set(payload) & set(reference['payload'])}))


def historical_producer_matches(value, expected):
    # Presence belongs to the closed envelope schema; this predicate owns only the producer join.
    return value.get('actor_ref', expected['actor_ref']) == expected['actor_ref']


def historical_matches(original, expected):
    return (retained_shape(original) and retained_flush(original) and retained_digest(original, True)
            and historical_envelope_matches(original['full_value'])
            and historical_payload_matches(original['full_value'], expected)
            and historical_producer_matches(original['full_value'], expected)
            and historical_binding(original['full_value'], expected))


def read_canonical_history(before, event):
    """Read full retained envelopes against their frozen write-time operation, never the live operation.

    written_operation is the synthetic resolved immutable operation witness. originals are synthetic
    Storage full-flush records. Their physical authentication remains native NOT_RUN. Current access
    and the withdrawal fence still apply; current admission, cutoffs, writer policy and live state do not.
    """
    require(flag(before['permission'], True) and flag(before['withdrawn'], False), 'permission_or_withdrawal')
    row = before['written_operation']
    require(valid_operation(row, operation_name(event_type(row, 'started')), True), 'invalid_operation')
    suffix = event.rsplit('.', 1)[1] if event.count('.') >= 2 else ''
    require(suffix in ('started', 'completed') and event == event_type(row, suffix), 'unknown_event')
    snapshot = {'operation': row, 'originals': before['originals'], 'withdrawn': before['withdrawn']}
    start_custody_gate(snapshot, canonical_history=True)
    record = before['originals'].get(event)
    require(historical_matches(record, canonical_value(row, suffix)), 'original_missing')
    return deepcopy(record['full_value'])


def run_canonical_history(fixtures, families):
    counts = {}
    for family in fixtures['canonical_history_families']:
        event = family['event_type']
        if event not in families:
            continue
        assert event not in counts
        names = [case['name'] for case in family['cases']]
        assert len(names) == len(set(names))
        required = {'canonical-retained', 'canonical-replay-only', 'compatibility-retained',
                    'compatibility-replay-only', 'live-operation-replaced', 'live-source-request-counters',
                    'withdrawn', 'permission-revoked', 'missing-start', 'forged-commitment',
                    'forged-rehashed-value', 'foreign-project', 'foreign-identity', 'foreign-family',
                    'numeric-1', 'numeric-1.0', 'numeric-1e0', 'numeric--0', 'numeric-01'}
        assert required <= {name.split(':', 1)[1] for name in names}, event
        for case in family['cases']:
            state = patch(family['states'][case['initial']], case.get('edits', []))
            before = deepcopy(state)
            try:
                if case.get('number_literal') is not None:
                    number = parse_json_number(case['number_literal'])
                    assert digest(number) == digest(case['canonical_number']), case['name']
                output = read_canonical_history(state, case['read'])
            except (Refusal, json.JSONDecodeError) as error:
                reason = 'invalid_json_number' if isinstance(error, json.JSONDecodeError) else str(error)
                assert case.get('refusal') == reason, (case['name'], reason)
            else:
                assert 'refusal' not in case, (case['name'], 'expected refusal')
                assert output == case['output'], (case['name'], 'wrong retained bytes')
            assert state == before, (case['name'], 'history mutated state')
        counts[event] = len(family['cases'])
    assert set(counts) == set(families)
    return counts


def run_numeric_writers(contexts):
    counts = {}
    for family in contexts:
        event = family['event_type']
        states = family.get('writer_states', family.get('states'))
        before = states['before']; untouched = deepcopy(before)
        counts[event] = 0
        for literal in ('1', '1.0', '1e0', '-0', '01'):
            try:
                number = parse_json_number(literal)
            except json.JSONDecodeError:
                assert literal == '01'
            else:
                value = canonical_value(before['operation'], event.rsplit('.', 1)[1])
                value['sequence_id'] = number
                after, output = append_current(before, value, event)
                canonical = {**value, 'sequence_id': int(number)}
                assert output == value and after['original']['full_value'] == value
                assert after['original']['full_value_sha256'] == digest(canonical)
                assert after['append_count'] == before['append_count'] + 1
                assert after['effect_count'] == before['effect_count']
                assert before == untouched
            counts[event] += 1
    return counts


def run_reference_cases(fixtures, families):
    """Per-family dormant/active/nested-base/cross-document reference mutations run through the walker."""
    counts = {}
    required = {'standing9-dormant-missing-ref', 'standing9-active-missing-ref', 'standing9-dormant-resolving-ref',
                'standing9-nested-id-base', 'standing9-cross-document-ref', 'standing9-cross-document-missing',
                'standing9-unknown-document', 'standing9-operation-dormant-missing-ref'}
    for case in fixtures['reference_cases']:
        event = case['event_type']; assert event in families, case['name']
        documents = deepcopy(checked_documents())
        target = documents[case['document']]['$defs'][case['definition']]
        target.update(deepcopy(case['merge']))
        failures = unresolved_references(documents)
        assert (not failures) == case['resolves'], (case['name'], failures)
        if not case['resolves']:
            assert all(f.get('ref') == case['expected_unresolved'] for f in failures) and failures, (case['name'], failures)
        counts.setdefault(event, set()).add(case['name'].split(':', 1)[1])
    assert set(counts) == set(families) and all(required <= names for names in counts.values()), counts
    return {event: len(names) for event, names in counts.items()}


MATRIX_DEFECTS = ('missing', 'digest', 'value-rehashed', 'operation-rehashed', 'identity-rehashed',
                  'family-rehashed', 'payload-rehashed', 'not-flushed', 'shape', 'withdrawn')
MATRIX_MODELS = ('phase', 'writer', 'boundary', 'reader')


def matrix_call(fixtures, family, path, edits, contracts):
    """Run one matrix path from its authored initial state; returns ('ok', after, output) or ('refused', code)."""
    event = family['event_type']; model = path['model']
    if model == 'boundary':
        case = next(c for c in fixtures['cases'] if c['name'] == path['case'])
        context = patch(case['context'], edits); before = deepcopy(context)
        result = accept(case['payload'], contracts[event], context)
        assert context == before, (path['name'], 'boundary check mutated context')
        return ('ok', None, None) if result else ('refused', False)
    states = {'phase': family['states'], 'reader': family['states'], 'writer': family['writer_states']}[model]
    state = patch(states[path['initial']], edits); before = deepcopy(state)
    try:
        if model == 'phase':
            action = deepcopy(path['action'])
            if 'expected_state' in action:
                action['expected_operation'] = deepcopy(states[action.pop('expected_state')]['operation'])
            after, output = transition(state, action)
        elif model == 'writer':
            after, output = append_current(state, deepcopy(path['value']), event)
        else:
            output = read_history(state, path['event']); after = state
    except Refusal as error:
        assert state == before, (path['name'], 'refusal mutated durable state')
        return ('refused', str(error))
    return ('ok', after, output)


def run_custody_matrix(fixtures, families, contracts):
    """Every live later-phase path x every start-record defect, for every exact family, must refuse exactly."""
    matrix = fixtures['start_custody_matrix']
    assert tuple(matrix['defects']) == MATRIX_DEFECTS and tuple(matrix['models']) == MATRIX_MODELS
    summary = {}
    for family in matrix['families']:
        event = family['event_type']; assert event in families and event not in summary
        stateful = next(x for x in fixtures['stateful_families'] if x['event_type'] == event)
        writer = next(x for x in fixtures['writer_families'] if x['event_type'] == event)
        context = {'event_type': event, 'states': stateful['states'], 'writer_states': writer['states']}
        started = event.rsplit('.', 1)[0] + '.started'
        names = [p['name'] for p in family['paths']]; assert len(names) == len(set(names)), event
        cells = 0; controls = 0; covered = set(); phases = set()
        for path in family['paths']:
            assert path['model'] in MATRIX_MODELS and path['name'].startswith(event + ':'), path['name']
            # Positive control: the intact path is live and does exactly what its authored expectation says.
            result = matrix_call(fixtures, context, path, [], contracts)
            assert result[0] == 'ok', (path['name'], 'positive control refused', result)
            if path['model'] in ('phase', 'writer'):
                states = context['states' if path['model'] == 'phase' else 'writer_states']
                assert result[1] == states[path['after']], (path['name'], 'wrong control state')
                assert result[2] == path.get('output'), (path['name'], 'wrong control output')
            elif path['model'] == 'reader':
                assert result[2] == path['output'], (path['name'], 'wrong history output')
            controls += 1
            op = path['action']['op'] if path['model'] == 'phase' else path['model']
            covered.add((path['model'], op))
            if path['model'] != 'boundary':
                states = context['states' if path['model'] != 'writer' else 'writer_states']
                phases.add((path['model'], states[path['initial']]['operation']['phase']))
            expected = False if path['model'] == 'boundary' else path['refusal']
            for record in path['records']:
                location = {'reduced': ['originals', started], 'canonical': ['original']}[record]
                for defect in MATRIX_DEFECTS[:-1]:
                    if defect == 'missing' and record in path.get('lawful_absent', []):
                        continue  # absence is the lawful pre-append state of first start admission
                    replacement = family['replacements'][record][defect]
                    # A missing reduced record is an absent key; a missing writer original is the null slot.
                    edits = [{'path': location, 'delete': True} if replacement is None and record == 'reduced'
                             else {'path': location, 'value': replacement}]
                    result = matrix_call(fixtures, context, path, edits, contracts)
                    assert result == ('refused', expected), (path['name'], record, defect, result)
                    cells += 1
            edits = [{'path': ['withdrawn'], 'value': True}]
            result = matrix_call(fixtures, context, path, edits, contracts)
            assert result == ('refused', False if path['model'] == 'boundary' else 'permission_or_withdrawal'), (
                path['name'], 'withdrawn', result)
            cells += 1
        index = '.index.' in event
        required = {('phase', op) for op in ('append_started', 'advance_started', 'settle', 'append_completed',
                                             'advance_completed', 'retry', 'replay', 'recover')}
        required |= {('phase', 'prepare'), ('phase', 'swap')} if index else set()
        required |= {('writer', 'writer'), ('boundary', 'boundary'), ('reader', 'reader')}
        assert required <= covered, (event, required - covered)
        later = {'started', 'effect_committed', 'completed'} | ({'prepared'} if index else set())
        assert {(m, ph) for m in ('phase', 'reader') for ph in later | {'accepted'}} <= phases, (event, phases)
        assert {('writer', ph) for ph in ({'effect_committed', 'completed'} if event.endswith('.completed')
                                          else {'accepted', 'started', 'completed'})} <= phases, (event, phases)
        assert cells == family['expected_cells'] and controls == len(family['paths']), (event, cells, controls)
        summary[event] = {'paths': controls, 'negative_cells': cells}
    assert set(summary) == set(families)
    return summary


def run_history(fixtures, families):
    """Standing check 10: retained originals stay readable across live-state change; withdrawn/forged refuse."""
    counts = {}
    required = {'history-after-completion', 'history-source-changed', 'history-request-changed',
                'history-counters-changed', 'history-withdrawn', 'history-permission-revoked',
                'history-forged-hash', 'history-forged-rehashed-value', 'history-forged-identity',
                'history-missing-start', 'history-not-yet-written', 'history-other-family',
                'history-event-trailing-lf'}
    for family in fixtures['history_families']:
        event = family['event_type']; assert event in families and event not in counts
        states = next(x for x in fixtures['stateful_families'] if x['event_type'] == event)['states']
        names = [c['name'] for c in family['cases']]
        assert len(names) == len(set(names)) and {event + ':' + n for n in required} <= set(names), event
        if '.index.' in event:
            assert event + ':history-selector-replaced' in names, event
        counts[event] = 0
        for case in family['cases']:
            state = patch(states[case['initial']], case.get('edits', [])); before = deepcopy(state)
            try:
                output = read_history(state, case['read'])
            except Refusal as error:
                assert case.get('refusal') == str(error), (case['name'], str(error))
            else:
                assert 'refusal' not in case, (case['name'], 'expected refusal')
                assert output == case['output'], (case['name'], 'wrong historical original')
            assert state == before, (case['name'], 'history read mutated state')
            counts[event] += 1
    assert set(counts) == set(families)
    return counts


def patch(value, edits):
    value = deepcopy(value)
    for edit in edits:
        target = value
        for key in edit['path'][:-1]:
            target = target[key]
        if edit.get('delete'):
            del target[edit['path'][-1]]
        else:
            target[edit['path'][-1]] = deepcopy(edit['value'])
    return value


def run_stateful(fixtures, families):
    counts = {}; schema_count = 0; trace_count = 0
    for case in fixtures['operation_cases']:
        result = valid_operation(case['value'], case['definition'])
        schema_result = validator('Plans/memory_maintenance_operation.schema.json', case['definition']).is_valid(case['value'])
        assert result == case['valid'], case['name']
        if 'schema_valid' in case:
            assert schema_result == case['schema_valid'], case['name']
        schema_count += 1
    for family in fixtures['stateful_families']:
        event = family['event_type']; assert event in families
        states = family['states']; counts[event] = 0
        names = [case['name'] for case in family['traces']]
        required = {'start-append-crash-recover', 'start-row-crash', 'effect-terminal-crash-convergence',
                    'terminal-append-crash-recover', 'terminal-row-crash', 'lost-ack-retry-replay-no-effects',
                    'stale-operation-cas', 'stale-terminal-cas', 'repeated-effect-refused',
                    'terminal-before-start', 'advance-before-receipt', 'changed-original-terminal',
                    'changed-retry-clock', 'changed-request', 'permission-refusal', 'withdrawal-refusal',
                    'settled-failure-original', 'failed-retry-no-effect', 'changed-retained-full-value',
                    'lost-retained-full-value', 'completed-recovery-permission-refusal',
                    'completed-recovery-withdrawal-refusal', 'completed-recovery-original',
                    'completed-recovery-lost-start'}
        if event.endswith('.started'):
            required |= {'completed-retry-lost-start'}
        required |= ({'prepare-swap-crash-convergence', 'prepared-recovery-selects-once',
                      'unprepared-swap', 'repeated-swap-refused', 'unselected-success-refused',
                      'stale-source-before-swap', 'missing-artifact-after-swap',
                      'intervening-selector-never-overwritten', 'exact-existing-selector-cas',
                      'existing-selector-post-swap-crash', 'foreign-selector-custody',
                      'unsorted-artifacts', 'duplicate-artifacts'} if '.index.' in event
                     else {'atomic-effect-no-repeat', 'stale-source-before-effect', 'repeated-unsettled-effect'})
        assert len(names) == len(set(names))
        assert {event + ':' + n for n in required} <= set(names), event
        assert all(n.startswith(event + ':') for n in names), event
        for case in family['traces']:
            state = patch(states[case['initial']], case.get('edits', []))
            for step in case['steps']:
                before = deepcopy(state); action = deepcopy(step['action'])
                if 'expected_state' in action:
                    action['expected_operation'] = deepcopy(states[action.pop('expected_state')]['operation'])
                try:
                    after, output = transition(state, action)
                except Refusal as e:
                    assert step.get('refusal') == str(e), (event, case['name'], str(e), step)
                    assert state == before, (event, case['name'], 'refusal mutated state')
                else:
                    assert 'refusal' not in step, (event, case['name'], 'expected refusal')
                    assert after == states[step['after']], (event, case['name'], action['op'], 'wrong durable state')
                    assert output == step.get('output'), (event, case['name'], 'wrong original result')
                    state = after
                counts[event] += 1
            trace_count += 1
    assert set(counts) == set(families)
    return counts, schema_count, trace_count


def run_writers(fixtures, families):
    counts = {}
    required = {'append-retry-original', 'retry-storage-clock-original', 'retry-semantic-conflict',
                'append-projector-replay-only', 'retry-projector-replay-only',
                'invalid-envelope-version', 'missing-replay-policy', 'wrong-payload-schema',
                'wrong-envelope-project', 'wrong-envelope-correlation', 'wrong-envelope-causation',
                'raw-project-partition', 'event-type-trailing-lf'}
    required |= {'standing2-application-' + n for n in
                 ('canonical-key', 'old-project-key', 'raw-server-key', 'trailing-lf-key')}
    required |= {'standing3-other-project', 'standing3-padded-project', 'standing6-conflict-payload'}
    required |= {'standing6-storage-' + n for n in ('sequence_id', 'observed_at_utc', 'persisted_at_utc')}
    required |= {'standing6-conflict-' + n for n in
                 ('actor_ref', 'occurred_at_utc', 'correlation_id', 'redaction_profile', 'producer_sequence_id')}
    for family in fixtures['writer_families']:
        event = family['event_type']; assert event in families and event not in counts
        cases = family['cases']; names = [c['name'] for c in cases]
        own_required = set(required)
        if event.endswith('.completed'):
            own_required |= {phase + '-retry-start-' + defect
                             for phase in ('effect_committed', 'completed', 'failed_effect', 'failed_completed')
                             for defect in ('missing', 'changed-hash', 'changed-value', 'not-flushed')}
            own_required |= {phase + '-retry-original-with-start'
                             for phase in ('effect_committed', 'completed', 'failed_effect', 'failed_completed')}
        assert len(names) == len(set(names)) and {event + ':' + n for n in own_required} <= set(names)
        states = family['states']; counts[event] = 0
        for case in cases:
            state = patch(states[case['initial']], case.get('edits', []))
            for step in case['steps']:
                before = deepcopy(state)
                try:
                    after, output = append_current(state, step['value'], event)
                except Refusal as error:
                    assert step.get('refusal') == str(error), (case['name'], str(error))
                    assert state == before, (case['name'], 'refusal mutated durable state')
                else:
                    assert 'refusal' not in step, (case['name'], 'expected refusal')
                    assert after == states[step['after']], (case['name'], 'wrong append state')
                    assert output == step['output'], (case['name'], 'wrong original')
                    assert after['effect_count'] == before['effect_count'] == 0
                    state = after
                counts[event] += 1
    assert set(counts) == set(families)
    return counts


@lru_cache(maxsize=1)
def checkpoint_validator():
    schema = load('Plans/event_record_index_checkpoint.schema.json')
    return Draft202012Validator({**schema, '$ref': '#/$defs/checkpoint'}, format_checker=enforced_formats())


def checkpoint_identity_matches(checkpoint, row, value, event):
    """Only the adopted SP-278 storage/event join; no projector, cursor advance or read authorization."""
    expected_id, expected_key = identity(event, row['storage_instance_id'], row['project_id'], row['operation_id'])
    return (valid_operation(row, operation_name(event), True) and historical_envelope_matches(value)
            and checkpoint_validator().is_valid(checkpoint['checkpoint'])
            and checkpoint['checkpoint']['storage_instance_id'] == row['storage_instance_id']
            and checkpoint['checkpoint_key'] == 'event_record_index_checkpoint.v1:' + row['storage_instance_id']
            and value['event_type'] == event and value['event_id'] == expected_id
            and value['idempotency_key'] == expected_key and value['scope_kind'] == 'project'
            and value['project_id'] == row['project_id']
            and value['payload'] == payload_from(row, event.rsplit('.', 1)[1]))


def run_checkpoint_joins(fixtures, families):
    # Reuse the existing generic checkpoint fixture; DMEM owns no checkpoint format or durable cursor.
    generic = load('Plans/event_record_index_checkpoint_contract_fixtures.json')['positive']['current_read_without_old_controls']
    counts = {}
    for family in fixtures['checkpoint_families']:
        event = family['event_type']; assert event in families and event not in counts
        names = [case['name'] for case in family['cases']]
        required = {'checkpoint-storage-positive', 'checkpoint-foreign-storage', 'checkpoint-foreign-key',
                    'checkpoint-foreign-event-identity'}
        assert len(names) == len(set(names)) and {event + ':' + n for n in required} <= set(names)
        counts[event] = 0
        for case in family['cases']:
            context = patch({'checkpoint': generic, 'operation': family['operation'],
                             'value': family['value']}, case.get('edits', []))
            before = deepcopy(context)
            result = checkpoint_identity_matches(context['checkpoint'], context['operation'], context['value'], event)
            assert result == case['accepted'], case['name']
            assert context == before, (case['name'], 'identity check mutated context')
            counts[event] += 1
    assert set(counts) == set(families)
    return counts


def check_resources():
    available = next(int(line.split()[1]) for line in Path('/proc/meminfo').read_text().splitlines()
                     if line.startswith('MemAvailable:')) // (1024**2)
    if available < 6:
        raise RuntimeError('PAUSED: free -g available below 6 GiB; do not continue checks')


def select_family(fixtures, event):
    value = dict(fixtures)
    for key, rows in fixtures.items():
        if isinstance(rows, list) and rows and isinstance(rows[0], dict) and 'event_type' in rows[0]:
            value[key] = [row for row in rows if row['event_type'] == event]
    if 'start_custody_matrix' in value:
        value['start_custody_matrix'] = {**value['start_custody_matrix'], 'families':
            [row for row in value['start_custody_matrix']['families'] if row['event_type'] == event]}
    if 'operation_cases' in value:
        value['operation_cases'] = [row for row in value['operation_cases'] if row['definition'] == operation_name(event)]
    if 'identifier_cases' in value:
        definitions = {event.replace('.', '_'), operation_name(event)}
        if '.index.' in event:
            kind = 'lexical' if '.lexical.' in event else 'semantic'
            definitions |= {kind+'_target', kind+'_selector'}
        value['identifier_cases'] = [row for row in value['identifier_cases'] if row['definition'] in definitions]
    return value


def boundary_domains():
    spec = importlib.util.spec_from_file_location('_dmem_boundary_domains', ROOT / 'scripts/pm_memory_boundary_domains.py')
    result = importlib.util.module_from_spec(spec); spec.loader.exec_module(result)
    return result


def write_recipes():
    spec = importlib.util.spec_from_file_location('_dmem_write_recipes', ROOT / 'scripts/pm_memory_write_recipes.py')
    result = importlib.util.module_from_spec(spec); spec.loader.exec_module(result)
    return result


def storage_metadata():
    spec = importlib.util.spec_from_file_location('_dmem_storage_metadata', ROOT / 'scripts/pm_memory_storage_metadata.py')
    result = importlib.util.module_from_spec(spec); spec.loader.exec_module(result)
    return result


def memory_policy():
    spec = importlib.util.spec_from_file_location('_dmem_policy', ROOT / 'scripts/pm_memory_policy.py')
    result = importlib.util.module_from_spec(spec); spec.loader.exec_module(result)
    return result


def main():
    parser = argparse.ArgumentParser(); parser.add_argument('--family'); args = parser.parse_args()
    check_resources()
    contracts = load('Plans/memory_maintenance_contracts.json'); fixtures = load('Plans/memory_maintenance_event_fixtures.json')
    registered = {x['event_type'] for x in load('Plans/event_family_registry.json')['families']}
    assert len(contracts['families']) == 8 and len(contracts['blocked_rows']) == 0
    assert not registered.intersection(x['event_type'] for x in contracts['families'])
    for filename in ('event_payloads', 'operation', 'rebuild_target', 'event_record'):
        Draft202012Validator.check_schema(load('Plans/memory_maintenance_' + filename + '.schema.json'))
    # Standing check 9 before any instance validation: dormant branches cannot hide an unresolved reference.
    mirrors = require_resolved_references()
    families = {x['event_type']: x for x in contracts['families']}; counts = {}
    if args.family:
        assert args.family in families
        families = {args.family: families[args.family]}; fixtures = select_family(fixtures, args.family)
    references = run_reference_cases(fixtures, families)
    for case in fixtures['cases']:
        event = case['event_type']; result = accept(case['payload'], families[event], case['context'])
        assert result == case['accepted'], case['name']
        counts[event] = counts.get(event, 0) + 1
        if case.get('retry'):
            args = (event, 'storage-1', case['payload']['project_id'], case['payload']['operation_id'])
            assert identity(*args) == tuple(case['expected_identity'])
            assert identity(*args) != identity(event, 'storage-2', args[2], args[3])
            assert identity(*args) != identity(event, args[1], 'other-project', args[3])
    assert set(counts) == set(families)
    stateful, schema_count, trace_count = run_stateful(fixtures, families)
    writers = run_writers(fixtures, families)
    checkpoints = run_checkpoint_joins(fixtures, families)
    matrix = run_custody_matrix(fixtures, families, families)
    history = run_history(fixtures, families)
    canonical_history = run_canonical_history(load('Plans/memory_canonical_history_fixtures.json'), families)
    numeric_writers = run_numeric_writers(fixtures['writer_families'])
    contexts = {f['event_type']: {**f, 'writer_states': next(w['states'] for w in fixtures['writer_families'] if w['event_type']==f['event_type'])} for f in fixtures['stateful_families']}
    domains = boundary_domains().run(__import__('sys').modules[__name__], contexts, fixtures['cases'])
    recipes = write_recipes().run(__import__('sys').modules[__name__], contexts)
    metadata = storage_metadata().run(__import__('sys').modules[__name__], contexts)
    policy = memory_policy().run(__import__('sys').modules[__name__], families)
    identifier_names = [case['name'] for case in fixtures['identifier_cases']]
    assert len(identifier_names) == len(set(identifier_names))
    assert {event.replace('.', '_') + ':' + name for event in families
            for name in ('standing4-max-inline-positive', 'standing4-oversize-rejected',
                         'standing8-unknown-process-exit-zero', 'trailing-lf:source_revision_sha256')} <= set(identifier_names)
    for case in fixtures['identifier_cases']:
        result = validator(case['schema'], case['definition']).is_valid(case['value'])
        assert result == case['valid'], case['name']
        if 'inline_cap' in case:
            assert case['inline_cap'] == 16384 and result and within_value_cap(case['value']), case['name']
    values = load('Plans/storage_value_registry.json')['families']; ops = load('Plans/memory_maintenance_operation.schema.json')
    target_schemas = load('Plans/memory_maintenance_rebuild_target.schema.json')['$defs']
    own_values = [v for v in values if v['family_id'] in ['memory_' + n + '_operation' for n in OP_NAMES]
                  or v['family_id'] in ['memory_index_lexical_selector', 'memory_index_semantic_selector']]
    assert len(own_values) == 6
    for value in own_values:
        assert value['retention_policy_ref'] == 'PENDING_RETENTION_DECISION'
        assert value['status'] == 'deferred_not_build_blocking'
        assert value['value_schema'] == {**ops['$defs'], **target_schemas}[value['value_schema_ref'].rsplit('/', 1)[1]]
    for contract in families.values():
        assert contract['membership'] == 'ABSENT' and contract['retention_policy_ref'] == 'PENDING_RETENTION_DECISION'
        assert contract['replay_policy'] == 'dedupe_by_idempotency_key'
        assert contract['payload_schema_id'] == (load('Plans/memory_maintenance_event_payloads.schema.json')['$id']
                                                + '#/$defs/' + contract['event_type'].replace('.', '_'))
        for path in [contract['semantic_owner'], contract['storage_owner'], contract['payload_owner']]:
            filename, unit = path.split('#'); assert 'plan_unit_id: ' + unit in (ROOT / filename).read_text()
        filename, unit = contract['storage_owner'].split('#')
        section = (ROOT / filename).read_text().split('### ' + unit + ' - ', 1)[1].split('\n### ', 1)[0]
        for token in ('SP-278', 'SP-286', 'CV-339', contract['consumer_id'], contract['event_type']):
            assert token in section
        for token in (contract['payload_schema_id'], contract['replay_policy'], 'replay_only_not_appendable'):
            assert token in section
        if contract['event_type'].startswith('memory.dedup_sweep.'):
            assert contract['approved_policy']['decisions'] == ['DL-444', 'DL-445']
            assert all(token in section for token in ('DL-444', 'DL-445', 'E-CARDS-2 Card 6.a'))
        # The one start custody gate is written in this family's own storage unit, citing SP-286 and its owners.
        gate = section.split('Start custody gate for exactly ' + contract['event_type'] + '@1.0.0', 1)[1].split('\n\n', 1)[0]
        for token in ('SP-286', 'CV-339', unit, contract['semantic_owner'].split('#')[1],
                      contract['payload_owner'].split('#')[1], 'start_receipt_missing', 'permission_or_withdrawal'):
            assert token in gate, (unit, token)
    print(json.dumps({'status': 'pass', 'families': counts, 'boundary_cases': sum(counts.values()),
                      'operation_cases': schema_count, 'stateful_traces': trace_count, 'stateful_steps': stateful,
                      'current_writer_steps': writers, 'identifier_cases': len(fixtures['identifier_cases']),
                      'generic_checkpoint_identity_cases': checkpoints,
                      'start_custody_matrix': matrix, 'history_cases': history,
                      'canonical_history_cases': canonical_history,
                      'numeric_writer_cases': numeric_writers, 'boundary_domains': domains, 'write_recipes': recipes,
                      'storage_uint64': metadata, 'card6_policy': policy,
                      'schema_reference_cases': references, 'registry_mirrors_reference_checked': mirrors,
                      'native': 'NOT_RUN', 'admission': 'ABSENT', 'retention': 'PENDING_RETENTION_DECISION'}, indent=2))


if __name__ == '__main__':
    main()
