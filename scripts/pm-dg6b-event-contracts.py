#!/usr/bin/env python3
"""Static DG6B contract oracles; no native execution or admission.

Method B guard tables (sweep part 2A). Every product refusal of this checker is
one named row of one phase table (scripts/pm_dg6b_table_<phase>.py, written by
scripts/pm-dg6b-table-generate.py), evaluated in the table's declared order by
require(). Derivation code here only computes observations (error counts,
canonical-byte digests, recomputed identities and expected values, presence);
it never decides acceptance. Harness assertions about fixtures, vectors and
canon bindings stay assertions: they are not product refusals.
"""
import ast
import copy
import datetime
import hashlib
import importlib
import json
import re
import sys
from functools import cache
from pathlib import Path
from jsonschema import Draft202012Validator as JsonSchemaValidator, FormatChecker, validators
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))

# Personas section 6, protected core built-ins only. First-party team Personas
# are explicitly outside this set; source_id may name a protected copy source.
# The guard row reads the same literal tuple (pm_dg6b_table_persona_mutation).
from pm_dg6b_table_persona_mutation import PROTECTED_PERSONA_IDS  # noqa: E402

TABLE_PHASES = (
    'json', 'references', 'preparation_a', 'preparation_b',
    'adapter_record', 'adapter_source', 'adapter_history', 'adapter_storage', 'adapter_resolved',
    'event_record', 'payload_schema', 'envelope_payload_schema', 'payload_types', 'source_scope',
    'persona_scope_schema', 'checkpoint_schema', 'owner_io_request', 'owner_io_result', 'selected_result_schema',
    'resolution_schema', 'resolution_storage_schema', 'operation_schema', 'operation_logical_schema',
    'append_policy', 'retry', 'source_grants', 'frozen_source', 'auth_scope', 'partition', 'identity_event',
    'identity_key', 'original_server', 'semantic_scope', 'semantic_original', 'hook_block', 'cadence',
    'envelope_a', 'envelope_b', 'payload_transport', 'checkpoint_join',
    'inline_size', 'reference', 'transport_integrity', 'operation_size', 'operation_ref',
    'operation_source', 'resolution_size', 'resolution_ref', 'resolution_source',
    'history_flags', 'history_storage',
    'persona_scope', 'persona_partition', 'persona_home', 'persona_library_home', 'definition_writer',
    'persona_mutation', 'persona_confirmation', 'persona_cas_lease', 'persona_source_trust', 'persona_reach',
    'persona_request_ref', 'persona_request_a', 'persona_request_b', 'persona_result_a', 'persona_result_b',
    'persona_home_copy', 'persona_creation', 'persona_delete_cas', 'persona_update_cas', 'persona_import_source',
    'persona_override_empty', 'persona_override_set', 'persona_lineage_copy', 'persona_resolution_a',
    'persona_resolution_b',
)
_TABLE_ROWS = {}
_TABLE_FIELDS = {}
# Set only by the guard-table suite builder (pm_dg6b_guard_suites); never by a checker path.
RECORDER = None
COLLECTOR = None
# The family whose witnesses are running ('shared' outside the family loops); recorder tag only.
CONTEXT = 'shared'


class TableRefusal(ValueError):
    """A refusal issued by one named table row; str() is the row's refusal code."""
    def __init__(self, phase, row, code):
        self.phase, self.row, self.code = phase, row, code
        super().__init__(code)


def table_module(phase):
    return importlib.import_module('pm_dg6b_table_' + phase)


def table_rows(phase):
    """The phase's (row, predicate, context) list in declared table order."""
    rows = _TABLE_ROWS.get(phase)
    if rows is None:
        case = table_module(phase).case(None)
        rows = _TABLE_ROWS[phase] = [(name, guard.predicate, case.context) for name, guard in case.table.guards.items()]
        _TABLE_FIELDS[phase] = table_module(phase).FIELDS
    return rows


def require(phase, facts):
    """Refuse through the first failing row of one phase table, in table order."""
    rows = table_rows(phase)
    fields = _TABLE_FIELDS[phase]
    assert sorted(facts) == sorted(fields), (phase, sorted(set(facts) ^ set(fields)))
    observed = {key: facts[key] for key in fields}
    refusal = None
    for name, predicate, context in rows:
        code = predicate(observed, context)
        if code is not None:
            refusal = (name, code)
            break
    if RECORDER is not None:
        RECORDER.append((CONTEXT, phase, copy.deepcopy(observed), refusal))
    if refusal is not None:
        raise TableRefusal(phase, *refusal)


def table_order_errors():
    """Each table factory's check() requires its rows in exactly the table order."""
    errors = []
    for phase in TABLE_PHASES:
        module = table_module(phase)
        tree = ast.parse(Path(module.__file__).read_text())
        factory = next(n for n in tree.body if isinstance(n, ast.FunctionDef) and n.name == 'case')
        check = next(n for n in factory.body if isinstance(n, ast.FunctionDef) and n.name == 'check')
        required = [c.args[0].value for c in ast.walk(check) if isinstance(c, ast.Call)
                    and ast.unparse(c.func) == 'table.require']
        if required != [name for name, _, _ in table_rows(phase)]:
            errors.append(phase)
    known = {p.name[len('pm_dg6b_table_'):-3] for p in (ROOT / 'scripts').glob('pm_dg6b_table_*.py')}
    errors.extend(sorted(known ^ set(TABLE_PHASES)))
    return errors


def refusal_sites():
    """Raise statements of this checker other than the table refusal and harness errors."""
    tree = ast.parse(Path(__file__).read_text())
    sites = []
    for node in ast.walk(tree):
        if isinstance(node, ast.Raise) and node.exc is not None:
            text = ast.unparse(node.exc)
            if not (text.startswith(('TableRefusal(', 'AssertionError(', 'KeyError(')) or text == 'exc'):
                sites.append((node.lineno, text))
    return sites


def digest_of(value, side):
    """Canonical identity of one side of an exact typed join (same_value).

    SHA-256 of the canonical binding bytes. A value with no canonical bytes has
    no identity: each side gets its own marker, so the join refuses exactly as
    same_value() did. This computes an observation; the row decides.
    """
    from pm_event_index_binding import binding_bytes
    try:
        return hashlib.sha256(binding_bytes(value)).hexdigest()
    except (TypeError, ValueError, UnicodeError):
        return 'unencodable:' + side


def error_count(definition, value, registry=None, format_checker=None):
    kwargs = {'format_checker': format_checker}
    if registry is not None:
        kwargs['registry'] = registry
    return sum(1 for _ in Draft202012Validator(definition, **kwargs).iter_errors(value))


def project_partition(project_id):
    import base64
    if type(project_id) is not str:
        return None
    return 'project~' + base64.urlsafe_b64encode(project_id.encode()).decode().rstrip('=')

# JSON Schema's mathematical integer includes 1.0. The selected physical codec
# accepts built-in integers only. Use that same domain at every typed boundary.
Draft202012Validator = validators.extend(JsonSchemaValidator, type_checker=
    JsonSchemaValidator.TYPE_CHECKER.redefine('integer', lambda checker, value: type(value) is int))


def same_value(left, right):
    """Exact typed equality; bool/int and int/float are never interchangeable."""
    from pm_event_index_binding import binding_bytes
    try:
        return binding_bytes(left) == binding_bytes(right)
    except (TypeError, ValueError, UnicodeError):
        return False


def closed(properties, optional=()):
    return {'type': 'object', 'additionalProperties': False, 'properties': properties,
            'required': [key for key in properties if key not in optional]}


@cache
def adapter_schema(kind, name=''):
    """Closed synthetic proof adapters, never a new native storage format."""
    string = {'type': 'string'}
    nullable = {'type': ['string', 'null']}
    boolean = {'type': 'boolean'}
    if kind == 'record':
        properties = {key: {'type': 'object'} for key in
                      ('payload', 'source', 'event_record', 'durable_read_token')}
        properties.update(scope_partition=string, resolved_payload={'type': ['object', 'null']},
                          label=string, expected_error=string)
        return closed(properties, ('label', 'expected_error'))
    if kind == 'source':
        properties = {key: string for key in ('storage_instance_id', 'actor_ref')}
        properties.update({key: nullable for key in ('requested_account_ref', 'effective_account_ref')})
        properties.update({key: boolean for key in ('writer_current', 'access_current')})
        properties['frozen_payload'] = {'type': 'object'}
        if name.startswith('persona.'):
            properties.update({key: {'type': 'object'} for key in ('request', 'result')})
            properties['owner_request_ref'] = string
            properties.update({key: boolean for key in ('protected_id', 'computer_mirror',
                'confirmation_current', 'source_verified', 'cas_current', 'reach_allows_no_project',
                'definition_writer_current')})
            if name == 'persona.selected':
                properties['resolution'] = {'type': 'object'}
                properties['resolution_value'] = {'type': 'object'}
                properties['resolved_resolution'] = {'type': ['object', 'null']}
        else:
            properties['scope'] = workflow_scope_schema()
        return closed(properties)
    if kind == 'history':
        properties = {key: boolean for key in ('retained', 'authentic', 'admitted_when_written',
            'reader_current', 'family_withdrawn', 'access_current', 'body_deleted')}
        properties.update({key: {'type': 'object'} for key in ('original', 'storage_record')})
        properties['live_state'] = closed({key: boolean for key in ('writer_current',
            'definition_writer_current', 'account_authenticated', 'plugin_loaded', 'persona_exists',
            'cas_current', 'selection_current')})
        properties.update(label=string, expected_error=string)
        return closed(properties, ('label', 'expected_error'))
    if kind == 'storage':
        return closed({'authenticated': boolean, 'storage_instance_id': string,
                       'scope_partition': string, 'event_record_bytes_hex': string})
    if kind == 'resolved':
        return closed({'ref': string, 'blake3_id': string, 'byte_size': {'type': 'integer', 'minimum': 0},
                       'media_type': string, 'bytes_hex': string, 'durable': boolean, 'access_current': boolean})
    raise KeyError(kind)  # harness misuse: the kind is always a literal


def adapter_contract(kind, value, name=''):
    require('adapter_' + kind, {'errors': error_count(adapter_schema(kind, name), value, format_checker=FORMAT)})


def payload_contract(name, payload, schema=None, phase='payload_schema'):
    schema = schema if schema is not None else load_plan('Plans/dg6b_event_contracts.schema.json')
    require(phase, {'errors': error_count(schema['$defs'][name.replace('.', '_')], payload, format_checker=FORMAT)})


def type_shape(definition):
    """Types at low-level relational helpers; full schemas remain at dispatch.

    Keep relational/schema refusals independently testable without ever reading
    a field as the wrong type. Enum/const-only properties still have exact types.
    """
    result = {key: copy.deepcopy(definition[key]) for key in
              ('type', 'required', 'additionalProperties') if key in definition}
    if 'type' not in result and ('const' in definition or 'enum' in definition):
        values = definition.get('enum', [definition.get('const')])
        names = {type(None): 'null', bool: 'boolean', int: 'integer', str: 'string', list: 'array', dict: 'object'}
        result['type'] = sorted({names[type(value)] for value in values})
    if 'properties' in definition:
        result['properties'] = {key: type_shape(value) for key, value in definition['properties'].items()}
    if 'items' in definition:
        result['items'] = type_shape(definition['items'])
    for keyword in ('anyOf', 'oneOf'):
        if keyword in definition:
            result['anyOf'] = [type_shape(value) for value in definition[keyword]]
    return result


@cache
def payload_type_definition(name):
    return type_shape(load_plan('Plans/dg6b_event_contracts.schema.json')['$defs'][name.replace('.', '_')])


def payload_type_contract(name, payload):
    definition = payload_type_definition(name)
    require('payload_types', {'errors': error_count(definition, payload, format_checker=FORMAT)})


@cache
def load_plan(path):
    return strict_json((ROOT / path).read_text())


def strict_json(text):
    duplicates = []

    def unique_pairs(pairs):
        result = {}
        for key, value in pairs:
            if key in result:
                duplicates.append(key)
            result[key] = value
        return result
    try:
        value, invalid = json.loads(text, object_pairs_hook=unique_pairs), False
    except json.JSONDecodeError:
        value, invalid = None, True
    require('json', {'duplicate_keys': len(duplicates), 'invalid': invalid})
    return value


def resolve_schema_graph(schema):
    """Resolve every reference eagerly, including unused defs/union branches.

    Only the selected local owner resources are trusted; no network retrieval.
    Walk with each resource's resolver so nested IDs retain their own base URI.
    """
    from referencing import Registry, Resource
    from referencing.jsonschema import DRAFT202012
    paths = ('Plans/shared_integration_runtime.schema.json',
             'Plans/shared_integration_runtime_expansion_contracts.schema.json',
             'Plans/event_record.schema.json', 'Plans/event_record_index_checkpoint.schema.json')
    documents = [schema] + [load_plan(path) for path in paths]
    resources = [(doc['$id'], Resource.from_contents(doc)) for doc in documents]
    resources.append(('https://puppetmaster.local/Plans/shared_integration_runtime.schema.json',
                      resources[1][1]))
    registry = Registry().with_resources(resources).crawl()
    count = 0
    unresolved = []

    def walk(node, resolver, root=False):
        nonlocal count
        if isinstance(node, dict):
            if not root and '$id' in node:
                resolver = resolver.in_subresource(Resource.from_contents(node, default_spec=DRAFT202012))
            for keyword in ('$ref', '$dynamicRef'):
                if keyword in node:
                    try:
                        resolver.lookup(node[keyword])
                    except Exception:
                        unresolved.append(node[keyword])
                    else:
                        count += 1
            for value in node.values():
                walk(value, resolver)
        elif isinstance(node, list):
            for value in node:
                walk(value, resolver)

    meta = validators.validator_for(Draft202012Validator.META_SCHEMA, default=Draft202012Validator)
    metaschema_errors = 0
    for doc, (_, resource) in zip(documents, resources):
        metaschema_errors += sum(1 for _ in meta(meta.META_SCHEMA, format_checker=meta.FORMAT_CHECKER).iter_errors(doc))
        walk(doc, registry.resolver_with_root(resource), root=True)
    require('references', {'metaschema_errors': metaschema_errors, 'unresolved': len(unresolved)})
    return count


def make_operation(name, case):
    p, source, event = case['payload'], case['source'], case['event_record']
    payload_contract(name, p)
    adapter_contract('source', source, name)
    return {'schema_id': 'pm.storage_value.' + name.replace('.', '_') + '_operation.v1',
            'schema_version': '1.0.0', 'event_type': name, 'scope_key': source_scope_key(source),
            'server_id': source_scope(source)['server_id'], 'actor_ref': source['actor_ref'],
            'payload': p, 'state': 'effect_committed',
            'effect_receipt_ref': p.get('owner_result_ref', p.get('plugin_receipt_ref', 'ref:result/auth')),
            'event_id': event['event_id'], 'idempotency_key': event['idempotency_key'],
            'replay_policy': event['replay_policy']}


def store_operation(logical, force_reference=False):
    """SP-337 physical value: complete logical operation or closed reference."""
    return store_value(logical, ('schema_id', 'schema_version', 'event_type'), force_reference)


def store_value(logical, routing_keys, force_reference=False):
    from blake3 import blake3
    from pm_event_index_binding import binding_bytes
    body = binding_bytes(logical)
    if len(body) <= 16384 and not force_reference:
        return copy.deepcopy(logical), None
    digest = blake3(body).hexdigest()
    value = {key: logical[key] for key in routing_keys}
    value['payload_ref'] = {'blake3_id': digest, 'byte_size': len(body), 'media_type': 'application/msgpack'}
    resolved = {'ref': 'ref:payload/' + digest, **value['payload_ref'], 'bytes_hex': body.hex(),
                'durable': True, 'access_current': True}
    return value, resolved


def operation_value_size(body):
    """Physical-value byte gate, before decoding or schema dispatch."""
    require('operation_size', {'size': len(body)})


def operation_schema_contract(name, value, schema):
    definition = schema['$defs'][name.replace('.', '_') + '_operation']
    require('operation_schema', {'errors': error_count(definition, value, format_checker=FORMAT)})


def resolved_body(resolved):
    """Referenced body bytes for the byte stages; b'' when absent or unreadable.

    An absent body is refused at reference availability, a malformed carrier at
    the resolved adapter and a non-hex body at transport integrity (TI04).
    """
    if type(resolved) is dict and type(resolved.get('bytes_hex')) is str:
        try:
            return bytes.fromhex(resolved['bytes_hex'])
        except ValueError:
            return b''
    return b''


def decoded_body(body):
    """(decoded, logical, re-encoded digest) of a referenced MessagePack body."""
    import msgpack
    try:
        logical = msgpack.unpackb(body, raw=False, strict_map_key=True)
    except (TypeError, ValueError, msgpack.UnpackException):
        return False, None, None
    return True, logical, digest_of(logical, 'decoded')


def operation_contract(name, value, resolved, expected, schema):
    from pm_event_index_binding import binding_bytes
    definition = schema['$defs'][name.replace('.', '_') + '_operation']
    operation_schema_contract(name, value, schema)
    operation_value_size(binding_bytes(value))
    if 'payload_ref' in value:
        ref = value['payload_ref']
        body = resolved_body(resolved)
        transport(body, 'ref:payload/' + ref['blake3_id'], resolved)
        decoded, logical, reencoded = decoded_body(body)
        # media_type is decided by OP01 (const) and TI03 (resolved media type).
        require('operation_ref', {'ref_blake3': ref['blake3_id'], 'resolved_blake3': resolved['blake3_id'],
                                  'ref_size': ref['byte_size'], 'resolved_size': resolved['byte_size'],
                                  'decoded': decoded, 'reencoded_digest': reencoded,
                                  'body_digest': hashlib.sha256(body).hexdigest()})
        require('operation_logical_schema', {'errors': error_count(definition['oneOf'][0], logical, format_checker=FORMAT)})
        # The former routing-header join (schema_id, schema_version, event_type) is
        # decided by OP01 and OG01, which bind the carrier and the decoded operation
        # to the same per-family constants; it can never refuse after them.
    else:
        logical = value
    # Authenticated bytes alone do not prove original payload/receipt custody.
    require('operation_source', {'logical_digest': digest_of(logical, 'logical'), 'expected_digest': digest_of(expected, 'expected')})
    return logical


def history_contract(name, case, schema):
    """Validate immutable at-write custody; current live state is not history.

    Original source evidence remains frozen. live_state describes subsequent
    disconnect/update/delete/CAS/selection state and never grants read access.
    """
    adapter_contract('history', case)
    require('history_flags', {key: case[key] for key in ('retained', 'authentic', 'admitted_when_written',
                                                          'family_withdrawn', 'reader_current', 'access_current', 'body_deleted')})
    # Frozen source admission is checked at its original boundary. Neither the
    # current writer policy nor later live state selects a historical reader.
    digest = record_contract(name, case['original'], schema)
    historical_storage_contract(case['original'], case['storage_record'])
    return digest


def historical_storage_contract(original, storage_record):
    """Independent verified Storage input, not a payload/caller assertion.

    The fixture adapter stands for Storage's authenticated selected source
    frame. It is not a new disk format or a native frame-verification claim.
    Compare complete exact canonical EventRecord bytes: the producer digest
    intentionally excludes Storage sequence/time and cannot prove this join.
    """
    from pm_event_index_binding import binding_bytes
    adapter_contract('storage', storage_record)
    try:
        record_hex = binding_bytes(original['event_record']).hex()
    except (TypeError, ValueError, UnicodeError):
        record_hex = None
    require('history_storage', {
        'authenticated': storage_record['authenticated'],
        'storage_instance_id': storage_record['storage_instance_id'],
        'token_storage_instance_id': original['durable_read_token']['storage_instance_id'],
        'scope_partition': storage_record['scope_partition'], 'original_scope_partition': original['scope_partition'],
        'storage_hex_digest': hashlib.sha256(storage_record['event_record_bytes_hex'].encode()).hexdigest(),
        'record_hex_digest': 'unencodable:original' if record_hex is None else hashlib.sha256(record_hex.encode()).hexdigest()})

def identity(name, payload, scope_key, server_id=None):
    payload_type_contract(name, payload)
    preimage = [name, payload['storage_instance_id'], scope_key, payload['operation_id'], payload['revision']]
    digest = hashlib.sha256(json.dumps(preimage, ensure_ascii=False, separators=(',', ':')).encode()).hexdigest()
    scope = payload.get('scope')
    application = scope['scope_kind'] == 'application' if scope else scope_key == 'application'
    if application:
        server_id = scope['server_id'] if scope else server_id
        original_server_required(server_id)  # before the key recipe reads it
        key = 'application@1:' + server_id.encode().hex() + ':' + payload['operation_id'].encode().hex()
    else:
        key = name + ':' + digest
    return 'evt_' + name.replace('.', '_') + '_' + digest, key


def original_server_required(server_id):
    require('original_server', {'server_id': server_id})

def semantic(name, payload, scope_key, event_id, original=None, server_id=None):
    payload_type_contract(name, payload)
    if name.startswith('auth.github.'):
        require('semantic_scope', {'scope_key': scope_key})
    require('identity_event', {'event_id': event_id, 'expected_event_id': identity(name, payload, scope_key, server_id)[0]})
    if original is not None:
        require('semantic_original', {'payload_digest': digest_of(payload, 'payload'),
                                      'original_payload_digest': digest_of(original, 'original')})
    if name == 'plugin.hook.blocked':
        require('hook_block', {'hook_name': payload['hook_name']})
    if name == 'auth.github.token.polling':
        previous = payload['previous_interval_seconds']
        require('cadence', {'poll_interval_seconds': payload['poll_interval_seconds'],
                            'expected_interval_seconds': previous + 5 if payload['outcome'] == 'slow_down' else previous})

FORMAT = FormatChecker()

@FORMAT.checks("date-time", raises=(ValueError, TypeError))
def utc_datetime(value):
    if type(value) is not str or re.fullmatch(
            r'[0-9]{4}-[0-9]{2}-[0-9]{2}[Tt][0-9]{2}:[0-9]{2}:[0-9]{2}(?:\.[0-9]+)?Z', value) is None:
        return False
    datetime.datetime.fromisoformat(value[:-1] + "+00:00")
    return True

def persona_scope_key(payload):
    scope_schema = workflow_scope_schema()
    require('persona_scope_schema', {'errors': error_count(scope_schema, payload.get('scope'))})
    return json.dumps([payload['scope']['server_id'], payload['scope']['scope_partition']],
                      ensure_ascii=False, separators=(',', ':'))


REQUEST_KEYS = ('command_id', 'client_id', 'persona_id', 'source_id', 'source_revision', 'source_sha256',
                'project_version_id', 'reach_ref', 'expected_owner_revision', 'return_context_ref')
RESULT_KEYS = (('command_id', 'command_id'), ('operation_id', 'operation_id'), ('persona_id', 'persona_id'),
               ('revision', 'owner_revision'), ('content_sha256', 'content_sha256'), ('result_status', 'status'),
               ('owner_result_ref', 'owner_result_ref'), ('owner_readback_ref', 'readback_ref'),
               ('return_context_ref', 'return_context_ref'))
RESOLUTION_KEYS = ('requested_persona', 'effective_persona', 'persona_selection_source', 'selection_reason',
                   'persona_override_scope', 'persona_override_owner_id', 'runtime_snapshot_ref', 'runtime_snapshot_sha256',
                   'operation_id', 'persona_id', 'owner_result_ref', 'selection_target_ref')
LINEAGE_KEYS = ('thread_id', 'run_id', 'node_id', 'attempt_id', 'actor_id')


def copy_facts(payload, source, pairs, side):
    facts = {}
    for payload_key, source_key in pairs:
        facts['payload_' + payload_key + '_digest'] = digest_of(payload[payload_key], 'payload')
        facts[side + '_' + source_key + '_digest'] = digest_of(source.get(source_key), side)
    assert len(facts) == 2 * len(pairs), ('copy join fields collide', pairs)
    return facts


def frozen_facts(payload, source):
    return {'payload_digest': digest_of(payload, 'payload'), 'frozen_payload_digest': digest_of(source['frozen_payload'], 'frozen'),
            'payload_storage_digest': digest_of(payload['storage_instance_id'], 'payload'),
            'source_storage_digest': digest_of(source['storage_instance_id'], 'source')}


def persona_semantic(name, payload, scope_key, source):
    """Static original-source oracle; not native authorization or source proof."""
    p, s = payload, source
    payload_type_contract(name, p)
    adapter_contract('source', s, name)
    persona_io_contract(p['command_id'], s)
    scope = p['scope']
    require('persona_scope', {'scope_key': persona_scope_key(p), 'expected_scope_key': scope_key,
                              'scope_digest': digest_of(scope, 'payload'),
                              'request_scope_digest': digest_of(s['request'].get('scope'), 'request')})
    if scope['scope_kind'] == 'project':
        require('persona_partition', {'scope_partition': scope['scope_partition'],
                                      'expected_partition': project_partition(scope['project_id'])})
    require('persona_home', {'home_kind': p['home_kind'], 'scope_kind': scope['scope_kind'],
                             'home_project_id': p['home_project_id'], 'project_id': scope['project_id']})
    if name != 'persona.selected':
        require('persona_library_home', {'home_kind': p['home_kind'], 'scope_kind': scope['scope_kind']})
    # Event-writer admission is independent of the definition-write lease.
    require('source_grants', {'writer_current': s['writer_current'], 'access_current': s['access_current']})
    if name != 'persona.exported':
        require('definition_writer', {'definition_writer_current': s['definition_writer_current']})
    if name in ('persona.created', 'persona.deleted', 'persona.imported', 'persona.updated'):
        require('persona_mutation', {'computer_mirror': s['computer_mirror'], 'protected_id': s['protected_id'],
                                     'persona_id': p['persona_id']})
    if name == 'persona.deleted':
        require('persona_confirmation', {'confirmation_current': s['confirmation_current']})
    if name in ('persona.deleted', 'persona.updated', 'persona.imported'):
        require('persona_cas_lease', {'cas_current': s['cas_current']})
    if name == 'persona.imported':
        require('persona_source_trust', {'source_verified': s['source_verified']})
    if name == 'persona.selected' and scope['scope_kind'] == 'application':
        require('persona_reach', {'reach_allows_no_project': s['reach_allows_no_project']})
    request, result = s['request'], s['result']
    require('frozen_source', frozen_facts(p, s))
    require('persona_request_ref', {'owner_request_ref_digest': digest_of(p['owner_request_ref'], 'payload'),
                                    'source_owner_request_ref_digest': digest_of(s['owner_request_ref'], 'source')})
    # The request scope copy is decided by persona_scope PC02 (same field, same
    # exact typed comparison) and is not repeated here.
    requested = [(key, key) for key in REQUEST_KEYS]
    require('persona_request_a', copy_facts(p, request, requested[:5], 'request'))
    require('persona_request_b', copy_facts(p, request, requested[5:], 'request'))
    require('persona_result_a', copy_facts(p, result, RESULT_KEYS[:5], 'result'))
    require('persona_result_b', copy_facts(p, result, RESULT_KEYS[5:], 'result'))
    require('persona_home_copy', copy_facts(p, request, [('home_ref', 'destination_home_ref'),
                                                         ('content_sha256', 'whole_record_sha256')], 'request'))
    if name == 'persona.created':
        require('persona_creation', {key: p[key] for key in ('command_id', 'source_id', 'source_revision', 'source_sha256',
                                                             'persona_id', 'result_status')})
    if name == 'persona.deleted':
        require('persona_delete_cas', {'expected_owner_revision': p['expected_owner_revision'], 'revision': p['revision']})
    if name == 'persona.updated':
        require('persona_update_cas', {key: p[key] for key in ('expected_owner_revision', 'source_revision', 'source_id',
                                                               'persona_id', 'source_sha256', 'revision')})
    if name == 'persona.imported':
        require('persona_import_source', {key: p[key] for key in ('source_id', 'source_revision', 'source_sha256')})
    if name == 'persona.selected':
        override = p['persona_override_scope']
        lineage = p['runtime_lineage']
        # The payload schema decides owner presence (const null without an override,
        # a nonempty string with one) and limits a non-null override to thread, run,
        # node, attempt or actor; those original clauses are decided there.
        require('persona_override_empty', {'override_scope': override,
                                           **{'lineage_' + key: lineage[key] for key in LINEAGE_KEYS}})
        require('persona_override_set', {'override_scope': override, 'override_owner': p['persona_override_owner_id'],
                                         'lineage_owner': lineage.get(override + '_id') if type(override) is str else None})
        require('persona_lineage_copy', {'lineage_digest': digest_of(lineage, 'payload'),
                                         'resolution_lineage_digest': digest_of(s['resolution'].get('runtime_lineage'), 'resolution')})
        resolved_keys = [(key, key) for key in RESOLUTION_KEYS]
        require('persona_resolution_a', copy_facts(p, s['resolution'], resolved_keys[:6], 'resolution'))
        require('persona_resolution_b', copy_facts(p, s['resolution'], resolved_keys[6:], 'resolution'))
        resolution_storage_contract(s['resolution_value'], s['resolved_resolution'], s['resolution'],
                                    load_plan('Plans/dg6b_event_contracts.schema.json'))


def selected_result_contract(value, shared, registry):
    definition = shared['$defs']['persona_select_result_v2']
    require('selected_result_schema', {'errors': error_count(definition, value, registry, FORMAT)})


def persona_io_contract(command, source):
    for kind in ('request', 'result'):
        definition, registry = persona_io_definition(command, kind)
        require('owner_io_' + kind, {'errors': error_count(definition, source[kind], registry, FORMAT)})


@cache
def persona_io_definition(command, kind):
    from referencing import Registry, Resource
    shared = load_plan('Plans/shared_integration_runtime.schema.json')
    resource = Resource.from_contents(strict_patterns(shared))
    registry = Registry().with_resources([(shared['$id'], resource),
        ('https://puppetmaster.local/Plans/shared_integration_runtime.schema.json', resource)])
    verb = command.split('.')[-1]
    definition = strict_patterns(shared['$defs']['persona_' + verb + '_' + kind + '_v2'])
    return definition, registry


def resolution_contract(value, schema):
    require('resolution_schema', {'errors': error_count(schema['$defs']['persona_selected_resolution'], value,
                                                        format_checker=FORMAT)})


def store_resolution(logical, force_reference=False):
    # Reuse the existing SP-337 complete-value route. No new physical family.
    return store_value(logical, ('schema_id', 'schema_version'), force_reference)


def resolution_value_size(body):
    require('resolution_size', {'size': len(body)})


def resolution_storage_contract(value, resolved, expected, schema):
    from pm_event_index_binding import binding_bytes
    definition = schema['$defs']['persona_selected_resolution_storage']
    require('resolution_storage_schema', {'errors': error_count(definition, value, format_checker=FORMAT)})
    resolution_value_size(binding_bytes(value))
    if 'payload_ref' in value:
        ref = value['payload_ref']
        body = resolved_body(resolved)
        transport(body, 'ref:payload/' + ref['blake3_id'], resolved)
        decoded, logical, reencoded = decoded_body(body)
        # media_type is decided by RT01 (const) and TI03 (resolved media type).
        require('resolution_ref', {**{name: digest_of(ref[key], 'ref') for name, key in (
            ('ref_blake3', 'blake3_id'), ('ref_size', 'byte_size'))},
            **{name: digest_of(resolved[key], 'resolved') for name, key in (
                ('resolved_blake3', 'blake3_id'), ('resolved_size', 'byte_size'))},
            'decoded': decoded, 'reencoded_digest': reencoded, 'body_digest': hashlib.sha256(body).hexdigest()})
    else:
        logical = value
    resolution_contract(logical, schema)
    require('resolution_source', {'logical_digest': digest_of(logical, 'logical'), 'expected_digest': digest_of(expected, 'expected')})
    return logical


def check_persona(row, schema):
    from referencing import Registry, Resource
    name, p = row['event_type'], row['valid']
    slug = name.replace('.', '_')
    shared = json.loads((ROOT / 'Plans/shared_integration_runtime.schema.json').read_text())
    resource = Resource.from_contents(strict_patterns(shared))
    registry = Registry().with_resources([(shared['$id'], resource),
        ('https://puppetmaster.local/Plans/shared_integration_runtime.schema.json', resource)])
    verb = {'created': 'create', 'deleted': 'delete', 'exported': 'export', 'imported': 'import',
            'selected': 'select', 'updated': 'update'}[name.split('.')[-1]]
    binding_pack = json.loads((ROOT / 'Plans/projects_refresh_command_bindings.json').read_text())
    binding = next(r for r in binding_pack['commands'] if r['command_id'] == 'cmd.persona.' + verb)
    assert binding['expected_event_types'] == []  # selected command is not admission
    assert binding['request_schema_ref'].endswith('/persona_' + verb + '_request_v2')
    assert binding['result_schema_ref'].endswith('/persona_' + verb + '_result_v2')
    assert schema['$defs'][slug]['properties']['scope'] == shared['$defs']['WorkflowScopeV2']
    eid, idem = identity(name, p, row['scope_key'])
    assert (eid, idem) == (row['expected_event_id'], row['expected_idempotency_key'])
    variants = [{'label': 'library_no_project', 'payload': p, 'source': row['source']}] + row['valid_variants']
    for variant in variants:
        body, source = variant['payload'], variant['source']
        payload_contract(name, body, schema)
        if name == 'persona.selected':
            selected_result_contract(source['result'], shared, registry)
        persona_io_contract(body['command_id'], source)
        if name == 'persona.selected':
            resolution_contract(source['resolution'], schema)
        sk = persona_scope_key(body)
        persona_semantic(name, body, sk, source)
        persona_semantic(name, copy.deepcopy(body), sk, source)
        veid, videm = identity(name, body, sk)
        assert identity(name, copy.deepcopy(body), sk) == (veid, videm)
        other_server = copy.deepcopy(body)
        other_server['scope']['server_id'] += '-other'
        assert identity(name, other_server, persona_scope_key(other_server)) != (veid, videm)
        operation = {'schema_id': 'pm.storage_value.' + slug + '_operation.v1', 'schema_version': '1.0.0',
                     'event_type': name, 'scope_key': sk, 'actor_ref': 'ref:actor/one', 'payload': body,
                     'state': 'effect_committed', 'effect_receipt_ref': body['owner_result_ref'],
                     'event_id': veid, 'idempotency_key': videm, 'server_id': body['scope']['server_id'],
                     'replay_policy': 'dedupe_by_idempotency_key'}
        operation_schema_contract(name, operation, schema)
    for index, bad in enumerate(row['invalid']):
        expect_failure(lambda: payload_contract(name, bad, schema), 'payload_schema', name, 'invalid/' + str(index))
    for case in row['semantic_invalid']:
        payload_contract(name, case['payload'], schema)  # relational negatives must remain shape-valid
        expect_failure(lambda: persona_semantic(name, case['payload'], case['scope_key'], case['source']),
                       case['expected_error'], name, 'semantic_invalid/' + case['case_id'])
    if name == 'persona.selected':
        original = row['source']['result']
        for alias in ('requested_persona_id', 'effective_persona_id'):
            expect_failure(lambda: selected_result_contract({**original, alias: 'forbidden'}, shared, registry),
                           'selected_result_schema', name, alias)
        resolution = row['source']['resolution']
        for alias in ('requested_persona_id', 'effective_persona_id'):
            expect_failure(lambda: resolution_contract({**resolution, alias: 'forbidden'}, schema),
                           'resolution_schema', name, alias)
        for key in ('requested_persona', 'effective_persona', 'runtime_snapshot_ref', 'runtime_snapshot_sha256'):
            expect_failure(lambda: resolution_contract({k: v for k, v in resolution.items() if k != key}, schema),
                           'resolution_schema', name, key)
    return {'event_type': name, 'status': 'pass', 'payload_negatives': len(row['invalid']),
            'relational_negatives': len(row['semantic_invalid']), 'positive_variants': len(variants),
            'event_id_vector': eid, 'native_execution': 'NOT_RUN'}


def source_scope(source):
    scope = source['request'].get('scope') if 'request' in source else source.get('scope')
    definition = workflow_scope_schema()
    require('source_scope', {'errors': error_count(definition, scope, format_checker=FORMAT)})
    return scope


def source_scope_key(source):
    scope = source_scope(source)
    if 'request' in source:
        return json.dumps([scope['server_id'], scope['scope_partition']], ensure_ascii=False, separators=(',', ':'))
    # Preserve the separately specified non-Persona Event ID recipe. The actual
    # Server is also stored and joined independently, and enters CV-366 app keys.
    return 'application' if scope['scope_kind'] == 'application' else 'project:' + scope['project_id']


def partition_contract(scope, partition):
    expected = 'app' if scope['scope_kind'] == 'application' else project_partition(scope['project_id'])
    require('partition', {'scope_partition': scope['scope_partition'], 'envelope_partition': partition,
                          'expected_partition': expected})


def stage_contract(name, case, schema):
    """Isolated pre-dispatch boundaries; never claim raw bytes as logical values.

    These are also called by the complete operation/append paths. A missing
    reference has no decodable body, so its availability control belongs at
    transport, rather than claiming it is an otherwise valid logical operation.
    """
    stages = {
        'operation_value_size': lambda: operation_value_size(bytes.fromhex(case['body_hex'])),
        'resolution_value_size': lambda: resolution_value_size(bytes.fromhex(case['body_hex'])),
        'adapter_schema': lambda: adapter_contract(case['kind'], case['value'], name),
        'transport': lambda: transport(bytes.fromhex(case['body_hex']), case['payload_ref'], case['resolved']),
        'reference_availability': lambda: reference_available(case['payload_ref'], case['resolved']),
        'partition': lambda: partition_contract(case['scope'], case['scope_partition']),
        'payload_schema': lambda: payload_contract(name, case['payload'], schema),
        'operation_schema': lambda: operation_schema_contract(name, case['value'], schema),
    }
    return stages[case['stage']]()  # an unknown fixture stage is a harness KeyError


def semantic_record(record):
    """CV EventRecord caller-owned semantic body; never Storage metadata."""
    fields = ('event_type', 'scope_kind', 'project_id', 'thread_id', 'run_id', 'node_id',
              'attempt_id', 'actor_ref', 'requested_account_ref', 'effective_account_ref',
              'occurred_at_utc', 'producer_sequence_id', 'correlation_id', 'causation_event_id',
              'parent_event_id', 'idempotency_key', 'payload_schema_id', 'payload', 'payload_ref',
              'redaction_profile', 'migration')
    return {key: record[key] for key in fields}


def strict_patterns(value):
    """Pair borrowed identifier patterns with an absolute end-of-input guard.

    Python's `$` also matches before a final LF. Keep the shared owner resource
    untouched while enforcing its entire identifier at this oracle boundary.
    """
    if isinstance(value, dict):
        result = {key: strict_patterns(item) for key, item in value.items()}
        if 'pattern' in result and result['pattern'].endswith('$'):
            result['pattern'] = result['pattern'][:-1] + '(?![\\s\\S])'
        return result
    if isinstance(value, list):
        return [strict_patterns(item) for item in value]
    return value


@cache
def workflow_scope_schema():
    return strict_patterns(load_plan('Plans/shared_integration_runtime.schema.json')['$defs']['WorkflowScopeV2'])


@cache
def durable_token_schema():
    definition = strict_patterns(load_plan('Plans/event_record_index_checkpoint.schema.json')['$defs']['read_token'])
    definition['required'].remove('redb_snapshot_id')
    del definition['properties']['redb_snapshot_id']  # DL-076: live-only
    return definition


def transport(body_bytes, payload_ref, resolved):
    """SP-337 byte-stage oracle, before family payload schema dispatch.

    resolved is a synthetic authenticated payload-store input, not another
    envelope field or a proposed physical payload-store schema.
    """
    from blake3 import blake3
    if payload_ref is None:
        require('inline_size', {'body_size': len(body_bytes)})
        return
    reference_available(payload_ref, resolved)
    try:
        resolved_bytes = hashlib.sha256(bytes.fromhex(resolved['bytes_hex'])).hexdigest()
    except ValueError:
        resolved_bytes = 'not_hex'
    require('transport_integrity', {'resolved_blake3': resolved['blake3_id'], 'body_blake3': blake3(body_bytes).hexdigest(),
                                    'resolved_size': resolved['byte_size'], 'body_size': len(body_bytes),
                                    'media_type': resolved['media_type'], 'resolved_bytes_digest': resolved_bytes,
                                    'body_bytes_digest': hashlib.sha256(body_bytes).hexdigest()})


def reference_available(payload_ref, resolved):
    if resolved is not None:
        adapter_contract('resolved', resolved)
    present = resolved is not None
    require('reference', {'resolved_present': present, 'payload_ref': payload_ref,
                          **{key: resolved[key] if present else None for key in ('durable', 'access_current')},
                          'resolved_ref': resolved['ref'] if present else None})


def append_contract(name, case, schema, original=None):
    """Current append/retry policy; never used to admit historical readers."""
    adapter_contract('record', case)
    e = case['event_record']
    event_record_contract(e)
    require('append_policy', {'replay_policy': e.get('replay_policy')})
    digest = record_contract(name, case, schema)
    if original is not None:
        o = original['event_record']
        require('retry', {'event_id': e['event_id'], 'original_event_id': o['event_id'],
                          'idempotency_key': e['idempotency_key'], 'original_idempotency_key': o['idempotency_key'],
                          'semantic_digest': digest_of(semantic_record(e), 'candidate'),
                          'original_semantic_digest': digest_of(semantic_record(o), 'original')})
    return digest


def record_contract(name, case, schema):
    """Immutable envelope, payload and frozen at-write source validation."""
    import rfc8785
    from pm_event_index_binding import binding_bytes
    adapter_contract('record', case)
    p, s, e = case['payload'], case['source'], case['event_record']
    event_record_contract(e)
    payload_contract(name, p, schema)
    if e['payload_ref'] is None:
        payload_contract(name, e['payload'], schema, phase='envelope_payload_schema')
    adapter_contract('source', s, name)
    scope = source_scope(s)
    require('source_grants', {'writer_current': s['writer_current'], 'access_current': s['access_current']})
    require('frozen_source', frozen_facts(p, s))
    if name.startswith('auth.github.'):
        require('auth_scope', {'scope_kind': scope['scope_kind']})
    partition_contract(scope, case['scope_partition'])
    # The former second WorkflowScopeV2 pass here (same scope, same schema, no
    # format checker) is decided by source_scope SC01, which runs it with formats.
    sk = source_scope_key(s)
    if name.startswith('persona.'):
        persona_semantic(name, p, sk, s)
    else:
        semantic(name, p, sk, e['event_id'], server_id=scope['server_id'])
    eid, idem = identity(name, p, sk, scope['server_id'])
    require('identity_event', {'event_id': e['event_id'], 'expected_event_id': eid})
    require('identity_key', {'idempotency_key': e['idempotency_key'], 'expected_idempotency_key': idem})
    lineage = p.get('runtime_lineage', {})
    require('envelope_a', {
        'event_type': e['event_type'], 'family': name, 'payload_schema_id': e['payload_schema_id'],
        'expected_payload_schema_id': schema['$id'] + '#/$defs/' + name.replace('.', '_'),
        'occurred_at_utc': e['occurred_at_utc'], 'ts': p['ts'], 'actor_ref': e['actor_ref'], 'source_actor_ref': s['actor_ref'],
        'redaction_profile': e['redaction_profile'], 'scope_kind': e['scope_kind'], 'source_scope_kind': scope['scope_kind'],
        'project_id': e['project_id'], 'source_project_id': scope['project_id']})
    require('envelope_b', {
        'requested_account_ref': e['requested_account_ref'], 'source_requested_account_ref': s['requested_account_ref'],
        'effective_account_ref': e['effective_account_ref'], 'source_effective_account_ref': s['effective_account_ref'],
        **{field: e[field] for field in ('thread_id', 'run_id', 'node_id', 'attempt_id')},
        **{'lineage_' + field: lineage.get(field) for field in ('thread_id', 'run_id', 'node_id', 'attempt_id')}})
    body_bytes = binding_bytes(p)  # byte-stage input only, not the SP-278 digest domain
    transport(body_bytes, e['payload_ref'], case['resolved_payload'])
    require('payload_transport', {'envelope_payload_digest': digest_of(e['payload'], 'envelope'),
                                  'expected_payload_digest': digest_of(p if e['payload_ref'] is None else {}, 'expected')})
    # This is the adopted generic read-token/storage join, not a new checkpoint.
    token = case['durable_read_token']
    read_schema = durable_token_schema()
    require('checkpoint_schema', {'errors': error_count(read_schema, token, format_checker=FORMAT)})
    require('checkpoint_join', {
        'token_storage_instance_id': token['storage_instance_id'],
        'selection_storage_instance_id': token['source_selection']['storage_instance_id'],
        'checkpoint_key': token['checkpoint_key'], 'payload_storage_instance_id': p['storage_instance_id'],
        'expected_checkpoint_key': 'event_record_index_checkpoint.v1:' + p['storage_instance_id']})
    return hashlib.sha256(rfc8785.dumps(semantic_record(e))).hexdigest()


def event_record_contract(event):
    envelope = load_plan('Plans/event_record.schema.json')
    require('event_record', {'errors': error_count(envelope, event, format_checker=FORMAT)})


def expect_failure(call, expected, name, label, row=None):
    """Harness: the call must refuse with exactly the expected code.

    When the guard-table suite builder installs COLLECTOR, the table evaluations
    of this negative are handed to it, with the call, while its closure is live.
    """
    start = len(RECORDER) if RECORDER is not None else 0
    try:
        call()
    except ValueError as exc:
        assert str(exc) == expected, (name, label, str(exc), expected)
        assert isinstance(exc, TableRefusal), (name, label, 'refusal outside a guard table', repr(exc))
        assert row is None or exc.row == row, (name, label, 'refused by', exc.row, 'not its own row', row)
    else:
        raise AssertionError((name, 'accepted negative', label))
    if COLLECTOR is not None:
        records = RECORDER[start:]
        del RECORDER[start:]
        COLLECTOR(name, label, expected, records, call)


def complete_append_contract(name, case, schema, original=None):
    """One complete current family path, including physical operation custody.

    Retry originals are independently checked before candidate comparison.
    Retained history continues to use history_contract's at-write boundary.
    """
    if original is not None:
        append_contract(name, original, schema)
    digest = append_contract(name, case, schema, original=original)
    if original is not None and not name.startswith('persona.'):
        scope = source_scope(case['source'])
        semantic(name, case['payload'], source_scope_key(case['source']), case['event_record']['event_id'],
                 original=original['payload'], server_id=scope['server_id'])
    if name == 'persona.selected':
        definition, registry = persona_io_definition(case['payload']['command_id'], 'result')
        selected_result_contract(case['source']['result'],
                                 {'$defs': {'persona_select_result_v2': definition}}, registry)
    logical = make_operation(name, case)
    value, resolved = store_operation(logical)
    operation_contract(name, value, resolved, logical, schema)
    return digest


def check_complete_negatives(row, schema):
    from pm_dg6b_full_oracles import family_probes, expected_error
    probes = family_probes(globals(), row)
    for probe in probes:
        probe.call(globals(), schema, positive=True)
        expect_failure(lambda: probe.call(globals(), schema), expected_error(probe),
                       row['event_type'], probe.id)
    return {'complete_path_negatives': len(probes), 'valid_pre_mutation_controls': len(probes),
            'schema_only_proof_cases': 0}


def check_append_contract(row, schema):
    name = row['event_type']
    # The declared main positive is an independent source join too. Mutating a
    # stock payload receipt must fail even if all added vectors are left intact.
    main = copy.deepcopy(row['append_valid'][0])
    main['payload'], main['source'] = row['valid'], row['source']
    append_contract(name, main, schema)
    for variant in row.get('valid_variants', []):
        matching = copy.deepcopy(next(c for c in row['append_valid'] if c['label'] == variant['label']))
        matching['payload'], matching['source'] = variant['payload'], variant['source']
        append_contract(name, matching, schema)
    for case in row['append_valid']:
        append_contract(name, case, schema)
        source = case['source']
        logical = make_operation(name, case)
        operation, resolved = store_operation(logical)
        operation_contract(name, operation, resolved, logical, schema)
        operation_schema_contract(name, operation, schema)
        for field in ('idempotency_key', 'actor_ref'):
            bad_operation = copy.deepcopy(logical)
            bad_operation[field] += '\n'
            expect_failure(lambda: operation_schema_contract(name, bad_operation, schema), 'operation_schema', name,
                           'operation_trailing_lf/' + case['label'] + '/' + field)
        withdrawn_policy = {**logical, 'replay_policy': 'projector_replay_only'}
        expect_failure(lambda: operation_schema_contract(name, withdrawn_policy, schema), 'operation_schema', name,
                       'operation_replay_only/' + case['label'])
        wrong_key = (name + ':' + '0' * 64 if source_scope(source)['scope_kind'] == 'application'
                     else 'application@1:11:22')
        expect_failure(lambda: operation_schema_contract(name, {**logical, 'idempotency_key': wrong_key}, schema),
                       'operation_schema', name, 'operation_wrong_key/' + case['label'])
        retry = copy.deepcopy(case)
        retry['event_record'].update(sequence_id=999, observed_at_utc='2026-11-04T13:00:00Z',
                                     persisted_at_utc='2026-11-04T14:00:00Z')
        assert append_contract(name, retry, schema, original=case) == append_contract(name, case, schema)
        # A caller-owned correlation change is shape-valid, and is not source
        # payload metadata; it must conflict at the original semantic boundary.
        retry['event_record']['correlation_id'] += '-changed'
        expect_failure(lambda: append_contract(name, retry, schema, original=case),
                       'idempotency_conflict', name, 'caller_semantic_change')
    for case in row['append_invalid']:
        expect_failure(lambda: append_contract(name, case, schema), case['expected_error'], name, case['label'])
    for case in row['operation_cases']:
        call = lambda: operation_contract(name, case['value'], case['resolved'], case['logical'], schema)
        if 'expected_error' in case:
            expect_failure(call, case['expected_error'], name, case['label'])
        else:
            call()
    for case in row.get('resolution_cases', []):
        call = lambda: resolution_storage_contract(case['value'], case['resolved'], case['logical'], schema)
        if 'expected_error' in case:
            expect_failure(call, case['expected_error'], name, case['label'])
        else:
            call()
    for case in row['stage_cases']:
        call = lambda: stage_contract(name, case, schema)
        if 'expected_error' in case:
            expect_failure(call, case['expected_error'], name, case['label'])
        else:
            call()
    for case in row['history_cases']:
        call = lambda: history_contract(name, case, schema)
        if 'expected_error' in case:
            expect_failure(call, case['expected_error'], name, case['label'])
        else:
            call()
    for case in row['retry_cases']:
        call = lambda: append_contract(name, case['candidate'], schema, original=case['original'])
        if 'expected_error' in case:
            expect_failure(call, case['expected_error'], name, case['label'])
        else:
            assert call() == append_contract(name, case['original'], schema), (name, 'retry digest drift')
    # Each family exercises the same byte-stage cutoff before payload dispatch;
    # these synthetic boundary bytes are not claimed as family schema positives.
    from blake3 import blake3
    for size in (16383, 16384, 16385):
        body = b'x' * size
        resolved = {'ref': 'ref:payload/boundary', 'blake3_id': blake3(body).hexdigest(),
                    'byte_size': size, 'media_type': 'application/msgpack', 'bytes_hex': body.hex(),
                    'durable': True, 'access_current': True}
        if size <= 16384:
            transport(body, None, None)
        else:
            expect_failure(lambda: transport(body, None, None), 'inline_body_too_large', name, '16k_plus_one')
        transport(body, resolved['ref'], resolved)
        for field, value, error in [('durable', False, 'payload_ref_unavailable'),
                                    ('access_current', False, 'payload_ref_unavailable'),
                                    ('byte_size', size + 1, 'payload_ref_integrity'),
                                    ('media_type', 'text/plain', 'payload_ref_integrity'),
                                    ('bytes_hex', '00', 'payload_ref_integrity'),
                                    ('blake3_id', '0' * 64, 'payload_ref_integrity')]:
            expect_failure(lambda field=field, value=value: transport(body, resolved['ref'], {**resolved, field: value}),
                           error, name, 'reference_' + field)
    complete = check_complete_negatives(row, schema)
    from pm_dg6b_round9_cases import family_cases
    round9 = family_cases(globals(), row, schema)
    for label, target, code, call in round9:
        if target is None:
            call()
        else:
            expect_failure(call, code, name, label, row=target)
    complete['round9_negatives'] = sum(target is not None for _, target, _, _ in round9)
    return {**complete, 'positive_envelopes': len(row['append_valid']), 'negative_envelopes': len(row['append_invalid']),
            'replay_only_refused': True, 'transport_boundary_bytes': [16383, 16384, 16385],
            'operation_cases': len(row['operation_cases']), 'history_cases': len(row['history_cases']),
            'storage_metadata_retry': 'same_semantic_digest', 'caller_semantic_retry': 'idempotency_conflict'}


def preparation_contract(expected, fixtures, grade, registry, values, schema):
    """Prepared-oracle metadata fences, independent of native admission.

    The operation binding compares canonical JSON text (exact typed), at least
    as strict as the former Python equality of the two definitions.
    """
    def text_digest(value):
        return hashlib.sha256(json.dumps(value, sort_keys=True, separators=(',', ':')).encode()).hexdigest()
    names = sorted(expected)
    require('preparation_a', {
        'fixture_families': sorted({r['event_type'] for r in fixtures['families']}), 'expected_families': names,
        'fixture_rows': len(fixtures['families']), 'grade_families': sorted({r['event_type'] for r in grade['rows']}),
        'dispositions': [r['disposition'] for r in grade['rows']]})
    entries = {r['family_id']: r for r in values['families']}
    rows = [entries.get(name.replace('.', '_') + '_operation') for name in names]
    meta = validators.validator_for(Draft202012Validator.META_SCHEMA, default=Draft202012Validator)
    require('preparation_b', {
        'registered': sorted(expected.intersection(r['event_type'] for r in registry['families'])),
        'retention_refs': [None if r is None else r['retention_policy_ref'] for r in rows],
        'value_schema_errors': sum(sum(1 for _ in meta(meta.META_SCHEMA, format_checker=meta.FORMAT_CHECKER).iter_errors(
            r['value_schema'])) for r in rows if r is not None),
        'value_schema_digests': ['missing' if r is None else text_digest(r['value_schema']) for r in rows],
        'operation_definition_digests': [text_digest(schema['$defs'][name.replace('.', '_') + '_operation']) for name in names]})


def run(fixtures_path=None, family=None):
    global CONTEXT
    order_errors, sites = table_order_errors(), refusal_sites()
    assert not order_errors, ('table_require_order', order_errors)
    assert not sites, ('refusal_outside_guard_table', sites)
    CONTEXT = 'shared'
    schema = json.loads((ROOT / 'Plans/dg6b_event_contracts.schema.json').read_text())
    resolved_references = resolve_schema_graph(schema)
    fixtures = strict_json((fixtures_path or ROOT / 'Plans/dg6b_event_contract_fixtures.json').read_text())
    expect_failure(lambda: strict_json('{"x":1,"x":2}'), 'duplicate_json_key', 'shared', 'duplicate_json_key')
    expect_failure(lambda: strict_json('{"x":01}'), 'invalid_json', 'shared', 'leading_zero')
    expected = {'auth.github.authenticated', 'auth.github.device_code.issued', 'auth.github.disconnected',
                'auth.github.failed', 'auth.github.token.polling', 'plugin.hook.blocked', 'plugin.hook.error',
                'plugin.hook.invoked', 'plugin.load_failed', 'plugin.loaded', 'plugin.permission.override',
                'plugin.tool.collision', 'plugin.tool.registered', 'persona.created', 'persona.deleted',
                'persona.exported', 'persona.imported', 'persona.selected', 'persona.updated'}
    grade = load_plan('reports/event-authority-20261104/DG6B.self-grade.json')
    registry = json.loads((ROOT / 'Plans/event_family_registry.json').read_text())
    values = json.loads((ROOT / 'Plans/storage_value_registry.json').read_text())
    preparation_contract(expected, fixtures, grade, registry, values, schema)
    from pm_dg6b_round9_cases import shared_cases
    for label, target, code, call in shared_cases(globals(), schema, fixtures, grade, registry, values, expected):
        expect_failure(call, code, 'shared', label, row=target)
    results = []
    family_rows = [row for row in fixtures['families'] if family is None or row['event_type'] == family]
    if not family_rows:
        raise KeyError('unknown_family: ' + str(family))
    for row in family_rows:
        name, p = row['event_type'], row['valid']
        CONTEXT = name
        payload_contract(name, p, schema)
        if name.startswith('persona.'):
            results.append(check_persona(row, schema))
            continue
        server = row['source']['scope']['server_id']
        eid, idem = identity(name, p, 'application', server)
        assert (eid, idem) == (row['expected_event_id'], row['expected_idempotency_key'])
        semantic(name, p, 'application', eid, server_id=server)
        semantic(name, copy.deepcopy(p), 'application', eid, original=p, server_id=server)
        assert identity(name, copy.deepcopy(p), 'application', server) == (eid, idem)
        probes = [('identity', lambda: semantic(name, p, 'application', 'other', server_id=server))]
        changed = {**p, 'ts': '2026-11-04T12:01:00Z'}
        probes.append(('original_payload_conflict', lambda: semantic(name, changed, 'application', eid, original=p, server_id=server)))
        if name.startswith('auth.'):
            project_eid = identity(name, p, 'project:other')[0]
            probes.append(('scope', lambda: semantic(name, p, 'project:other', project_eid)))
        else:
            # Same operation in another source scope cannot have the original identity.
            probes.append(('identity', lambda: semantic(name, p, 'project:other', eid)))
        if name == 'auth.github.token.polling':
            bad = {**p, 'poll_interval_seconds': p['previous_interval_seconds']}
            payload_contract(name, bad, schema)  # schema-valid relational negative
            probes.append(('cadence', lambda: semantic(name, bad, 'application', eid, server_id=server)))
        if name == 'plugin.hook.blocked':
            for hook in ('pre_tool_invoke', 'pre_attempt_start', 'pre_node_dispatch'):
                valid_hook = {**p, 'hook_name': hook}
                payload_contract(name, valid_hook, schema)
                semantic(name, valid_hook, 'application', eid, server_id=server)
            for hook in ('post_tool_invoke', 'post_attempt_complete'):
                observation = {**p, 'hook_name': hook}
                probes.append(('observation_only_hook',
                               lambda bad=observation: semantic(name, bad, 'application', eid, server_id=server)))
        for index, (reason, call) in enumerate(probes):
            expect_failure(call, reason, name, 'relational/' + str(index) + '/' + reason)
        for index, bad in enumerate(row['invalid']):
            expect_failure(lambda: payload_contract(name, bad, schema), 'payload_schema', name, 'invalid/' + str(index))
        results.append({'event_type': name, 'payload_negatives': len(row['invalid']),
                        'relational_negatives': len(probes), 'event_id_vector': eid, 'status': 'pass'})
    for row, result in zip(family_rows, results):
        CONTEXT = row['event_type']
        result['append_oracles'] = check_append_contract(row, schema)
    CONTEXT = 'shared'
    return {'status': 'pass', 'native_execution': 'NOT_RUN',
            'resolved_schema_references': resolved_references, 'rows': results}

if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--fixtures', type=Path, help='Full fixture pack, including adversarial positive mutations.')
    parser.add_argument('--family', help='Run one complete family serially.')
    args = parser.parse_args()
    print(json.dumps(run(args.fixtures, args.family), indent=2))
