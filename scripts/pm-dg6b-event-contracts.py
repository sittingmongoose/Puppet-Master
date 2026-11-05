#!/usr/bin/env python3
"""Static DG6B contract oracles; no native execution or admission."""
import copy
import datetime
import hashlib
import json
import re
from functools import cache
from pathlib import Path
from jsonschema import Draft202012Validator as JsonSchemaValidator, FormatChecker, validators
ROOT = Path(__file__).resolve().parents[1]

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
    raise ValueError('unknown_adapter_kind')


def adapter_contract(kind, value, name=''):
    if list(Draft202012Validator(adapter_schema(kind, name), format_checker=FORMAT).iter_errors(value)):
        raise ValueError('adapter_schema')


def payload_contract(name, payload, schema=None):
    schema = schema if schema is not None else load_plan('Plans/dg6b_event_contracts.schema.json')
    if list(Draft202012Validator(schema['$defs'][name.replace('.', '_')], format_checker=FORMAT).iter_errors(payload)):
        raise ValueError('payload_schema')


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
    if list(Draft202012Validator(definition, format_checker=FORMAT).iter_errors(payload)):
        raise ValueError('payload_types')


@cache
def load_plan(path):
    return strict_json((ROOT / path).read_text())


def strict_json(text):
    def unique_pairs(pairs):
        result = {}
        for key, value in pairs:
            if key in result:
                raise ValueError('duplicate_json_key')
            result[key] = value
        return result
    try:
        return json.loads(text, object_pairs_hook=unique_pairs)
    except json.JSONDecodeError as exc:
        raise ValueError('invalid_json') from exc


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

    def walk(node, resolver, root=False):
        nonlocal count
        if isinstance(node, dict):
            if not root and '$id' in node:
                resolver = resolver.in_subresource(Resource.from_contents(node, default_spec=DRAFT202012))
            for keyword in ('$ref', '$dynamicRef'):
                if keyword in node:
                    try:
                        resolver.lookup(node[keyword])
                    except Exception as exc:
                        raise ValueError('unresolved_schema_ref: ' + node[keyword]) from exc
                    count += 1
            for value in node.values():
                walk(value, resolver)
        elif isinstance(node, list):
            for value in node:
                walk(value, resolver)

    for doc, (_, resource) in zip(documents, resources):
        Draft202012Validator.check_schema(doc)
        walk(doc, registry.resolver_with_root(resource), root=True)
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
    if len(body) > 16384:
        raise ValueError('operation_value_too_large')


def operation_contract(name, value, resolved, expected, schema):
    import msgpack
    from pm_event_index_binding import binding_bytes
    definition = schema['$defs'][name.replace('.', '_') + '_operation']
    if list(Draft202012Validator(definition, format_checker=FORMAT).iter_errors(value)):
        raise ValueError('operation_schema')
    operation_value_size(binding_bytes(value))
    if 'payload_ref' in value:
        ref = value['payload_ref']
        try:
            body = bytes.fromhex(resolved['bytes_hex']) if resolved is not None else b''
            transport(body, 'ref:payload/' + ref['blake3_id'], resolved)
            if any(ref[key] != resolved[key] for key in ('blake3_id', 'byte_size', 'media_type')):
                raise ValueError('payload_ref_integrity')
            logical = msgpack.unpackb(body, raw=False, strict_map_key=True)
            if binding_bytes(logical) != body:
                raise ValueError('payload_ref_integrity')
        except (TypeError, KeyError, msgpack.UnpackException) as exc:
            raise ValueError('payload_ref_integrity') from exc
        if list(Draft202012Validator(definition['oneOf'][0], format_checker=FORMAT).iter_errors(logical)):
            raise ValueError('operation_schema')
        if any(value[key] != logical[key] for key in ('schema_id', 'schema_version', 'event_type')):
            raise ValueError('operation_source_join')
    else:
        logical = value
    # Authenticated bytes alone do not prove original payload/receipt custody.
    if not same_value(logical, expected):
        raise ValueError('operation_source_join')
    return logical


def history_contract(name, case, schema):
    """Validate immutable at-write custody; current live state is not history.

    Original source evidence remains frozen. live_state describes subsequent
    disconnect/update/delete/CAS/selection state and never grants read access.
    """
    adapter_contract('history', case)
    if case['retained'] is not True or case['authentic'] is not True or case['admitted_when_written'] is not True:
        raise ValueError('historical_provenance')
    if case['family_withdrawn'] is not False or case['reader_current'] is not True:
        raise ValueError('historical_withdrawn')
    if case['access_current'] is not True or case['body_deleted'] is not False:
        raise ValueError('historical_access')
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
    if storage_record['authenticated'] is not True:
        raise ValueError('historical_storage_source')
    if (storage_record['storage_instance_id'] != original['durable_read_token']['storage_instance_id']
            or storage_record['scope_partition'] != original['scope_partition']):
        raise ValueError('historical_storage_join')
    if binding_bytes(original['event_record']).hex() != storage_record['event_record_bytes_hex']:
        raise ValueError('historical_storage_record')

def identity(name, payload, scope_key, server_id=None):
    payload_type_contract(name, payload)
    preimage = [name, payload['storage_instance_id'], scope_key, payload['operation_id'], payload['revision']]
    digest = hashlib.sha256(json.dumps(preimage, ensure_ascii=False, separators=(',', ':')).encode()).hexdigest()
    scope = payload.get('scope')
    application = scope['scope_kind'] == 'application' if scope else scope_key == 'application'
    if application:
        server_id = scope['server_id'] if scope else server_id
        original_server_required(server_id)
        key = 'application@1:' + server_id.encode().hex() + ':' + payload['operation_id'].encode().hex()
    else:
        key = name + ':' + digest
    return 'evt_' + name.replace('.', '_') + '_' + digest, key


def original_server_required(server_id):
    if type(server_id) is not str or not server_id:
        raise ValueError('original_server_required')

def semantic(name, payload, scope_key, event_id, original=None, server_id=None):
    payload_type_contract(name, payload)
    if name.startswith('auth.github.') and scope_key != 'application':
        raise ValueError('scope')
    if identity(name, payload, scope_key, server_id)[0] != event_id:
        raise ValueError('identity')
    if original is not None and not same_value(original, payload):
        raise ValueError('original_payload_conflict')
    if name == 'plugin.hook.blocked' and payload['hook_name'] not in (
            'pre_tool_invoke', 'pre_attempt_start', 'pre_node_dispatch'):
        raise ValueError('observation_only_hook')
    if name == 'auth.github.token.polling':
        previous = payload['previous_interval_seconds']
        expected = previous + 5 if payload['outcome'] == 'slow_down' else previous
        if payload['poll_interval_seconds'] != expected:
            raise ValueError('cadence')

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
    if list(Draft202012Validator(scope_schema).iter_errors(payload.get('scope'))):
        raise ValueError('scope')
    return json.dumps([payload['scope']['server_id'], payload['scope']['scope_partition']],
                      ensure_ascii=False, separators=(',', ':'))


def persona_semantic(name, payload, scope_key, source):
    """Static original-source oracle; not native authorization or source proof."""
    import base64
    p, s = payload, source
    payload_type_contract(name, p)
    adapter_contract('source', s, name)
    persona_io_contract(p['command_id'], s)
    scope = p['scope']
    if persona_scope_key(p) != scope_key or not same_value(scope, s['request'].get('scope')):
        raise ValueError('scope')
    if scope['scope_kind'] == 'project':
        expected = 'project~' + base64.urlsafe_b64encode(scope['project_id'].encode()).decode().rstrip('=')
        if scope['scope_partition'] != expected:
            raise ValueError('partition')
    if p['home_kind'] == 'project' and (scope['scope_kind'] != 'project'
            or p['home_project_id'] != scope['project_id']):
        raise ValueError('home_scope')
    if name != 'persona.selected' and p['home_kind'] == 'library' and scope['scope_kind'] != 'application':
        raise ValueError('home_scope')
    if s['access_current'] is not True:
        raise ValueError('access')
    # Event-writer admission is independent of the definition-write lease.
    if s['writer_current'] is not True:
        raise ValueError('writer')
    if name != 'persona.exported' and s['definition_writer_current'] is not True:
        raise ValueError('definition_writer')
    if name in ('persona.created', 'persona.deleted', 'persona.imported', 'persona.updated'):
        if s['computer_mirror'] is not False:
            raise ValueError('mirror')
        if s['protected_id'] is not False:
            raise ValueError('protected')
    if name == 'persona.deleted' and s['confirmation_current'] is not True:
        raise ValueError('confirmation')
    if name in ('persona.deleted', 'persona.updated', 'persona.imported') and s['cas_current'] is not True:
        raise ValueError('cas')
    if name == 'persona.imported' and s['source_verified'] is not True:
        raise ValueError('source_trust')
    if name == 'persona.selected' and scope['scope_kind'] == 'application' and s['reach_allows_no_project'] is not True:
        raise ValueError('reach')
    request, result = s['request'], s['result']
    if not same_value(p, s['frozen_payload']) or not same_value(p['owner_request_ref'], s['owner_request_ref']):
        raise ValueError('original_source_join')
    for key in ('command_id', 'scope', 'client_id', 'persona_id', 'source_id', 'source_revision',
                'source_sha256', 'project_version_id', 'reach_ref', 'expected_owner_revision', 'return_context_ref'):
        if not same_value(p[key], request.get(key)):
            raise ValueError('original_source_join')
    for payload_key, result_key in [('command_id', 'command_id'), ('operation_id', 'operation_id'),
            ('persona_id', 'persona_id'), ('revision', 'owner_revision'), ('content_sha256', 'content_sha256'),
            ('result_status', 'status'), ('owner_result_ref', 'owner_result_ref'),
            ('owner_readback_ref', 'readback_ref'), ('return_context_ref', 'return_context_ref')]:
        if not same_value(p[payload_key], result.get(result_key)):
            raise ValueError('original_source_join')
    if not same_value(p['storage_instance_id'], s['storage_instance_id']) or not same_value(p['home_ref'], request.get('destination_home_ref')):
        raise ValueError('original_source_join')
    if not same_value(p['content_sha256'], request.get('whole_record_sha256')):
        raise ValueError('original_source_join')
    source_fields = [p[k] for k in ('source_id', 'source_revision', 'source_sha256')]
    if name == 'persona.created':
        duplicate = p['command_id'] == 'cmd.persona.duplicate'
        if (duplicate and (None in source_fields or p['source_id'] == p['persona_id'] or p['result_status'] != 'duplicated')
                or not duplicate and (any(x is None for x in source_fields) != all(x is None for x in source_fields)
                                      or p['result_status'] != 'created')):
            raise ValueError('creation_source')
    if name == 'persona.deleted' and p['expected_owner_revision'] != p['revision']:
        raise ValueError('cas')
    if name == 'persona.updated' and (p['expected_owner_revision'] != p['source_revision']
            or p['source_id'] != p['persona_id'] or None in source_fields
            or p['expected_owner_revision'] >= p['revision']):
        raise ValueError('cas')
    if name == 'persona.imported' and None in source_fields:
        raise ValueError('source_trust')
    if name == 'persona.selected':
        override = p['persona_override_scope']
        owner = p['persona_override_owner_id']
        lineage = p['runtime_lineage']
        if override is None:
            if owner is not None or any(value is not None for value in lineage.values()):
                raise ValueError('override_lineage')
        elif (override not in ('thread', 'run', 'node', 'attempt', 'actor')
              or owner is None or owner == 'tier_id' or owner != lineage[override + '_id']):
            raise ValueError('override_lineage')
        if not same_value(lineage, s['resolution'].get('runtime_lineage')):
            raise ValueError('original_source_join')
        for key in ('requested_persona', 'effective_persona', 'persona_selection_source', 'selection_reason',
                    'persona_override_scope', 'persona_override_owner_id', 'runtime_snapshot_ref', 'runtime_snapshot_sha256'):
            if not same_value(p[key], s['resolution'].get(key)):
                raise ValueError('original_source_join')
        for key in ('operation_id', 'persona_id', 'owner_result_ref', 'selection_target_ref'):
            if not same_value(p[key], s['resolution'].get(key)):
                raise ValueError('original_source_join')
        resolution_storage_contract(s['resolution_value'], s['resolved_resolution'], s['resolution'],
                                    load_plan('Plans/dg6b_event_contracts.schema.json'))


def selected_result_contract(value, shared, registry):
    definition = shared['$defs']['persona_select_result_v2']
    if list(Draft202012Validator(definition, registry=registry, format_checker=FORMAT).iter_errors(value)):
        raise ValueError('selected_result_schema')


def persona_io_contract(command, source):
    for kind in ('request', 'result'):
        definition, registry = persona_io_definition(command, kind)
        if list(Draft202012Validator(definition, registry=registry, format_checker=FORMAT).iter_errors(source[kind])):
            raise ValueError('source_io_schema')


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
    if list(Draft202012Validator(schema['$defs']['persona_selected_resolution'], format_checker=FORMAT).iter_errors(value)):
        raise ValueError('resolution_schema')


def store_resolution(logical, force_reference=False):
    # Reuse the existing SP-337 complete-value route. No new physical family.
    return store_value(logical, ('schema_id', 'schema_version'), force_reference)


def resolution_value_size(body):
    if len(body) > 16384:
        raise ValueError('resolution_value_too_large')


def resolution_storage_contract(value, resolved, expected, schema):
    import msgpack
    from pm_event_index_binding import binding_bytes
    definition = schema['$defs']['persona_selected_resolution_storage']
    if list(Draft202012Validator(definition, format_checker=FORMAT).iter_errors(value)):
        raise ValueError('resolution_storage_schema')
    resolution_value_size(binding_bytes(value))
    if 'payload_ref' in value:
        ref = value['payload_ref']
        try:
            body = bytes.fromhex(resolved['bytes_hex']) if resolved is not None else b''
            transport(body, 'ref:payload/' + ref['blake3_id'], resolved)
            if any(not same_value(ref[key], resolved[key]) for key in ('blake3_id', 'byte_size', 'media_type')):
                raise ValueError('payload_ref_integrity')
            logical = msgpack.unpackb(body, raw=False, strict_map_key=True)
            if binding_bytes(logical) != body:
                raise ValueError('payload_ref_integrity')
        except (TypeError, KeyError, msgpack.UnpackException) as exc:
            raise ValueError('payload_ref_integrity') from exc
    else:
        logical = value
    resolution_contract(logical, schema)
    if not same_value(logical, expected):
        raise ValueError('resolution_source_join')
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
    validator = Draft202012Validator(schema['$defs'][slug], format_checker=FORMAT)
    assert schema['$defs'][slug]['properties']['scope'] == shared['$defs']['WorkflowScopeV2']
    eid, idem = identity(name, p, row['scope_key'])
    assert (eid, idem) == (row['expected_event_id'], row['expected_idempotency_key'])
    variants = [{'label': 'library_no_project', 'payload': p, 'source': row['source']}] + row['valid_variants']
    for variant in variants:
        body, source = variant['payload'], variant['source']
        validator.validate(body)
        actual_verb = body['command_id'].split('.')[-1]
        for kind in ('request', 'result'):
            ref = shared['$defs']['persona_' + actual_verb + '_' + kind + '_v2']
            if name == 'persona.selected' and kind == 'result':
                selected_result_contract(source[kind], shared, registry)
            else:
                Draft202012Validator(ref, registry=registry, format_checker=FORMAT).validate(source[kind])
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
        Draft202012Validator(schema['$defs'][slug + '_operation'], format_checker=FORMAT).validate(operation)
    for bad in row['invalid']:
        assert list(validator.iter_errors(bad)), (name, 'accepted negative', bad)
    for case in row['semantic_invalid']:
        validator.validate(case['payload'])  # relational negatives must remain shape-valid
        try:
            persona_semantic(name, case['payload'], case['scope_key'], case['source'])
        except ValueError as exc:
            assert str(exc) == case['expected_error'], (name, case['case_id'], str(exc), case['expected_error'])
        else:
            raise AssertionError((name, 'accepted semantic negative', case['case_id']))
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
    if list(Draft202012Validator(definition, format_checker=FORMAT).iter_errors(scope)):
        raise ValueError('scope')
    return scope


def source_scope_key(source):
    scope = source_scope(source)
    if 'request' in source:
        return json.dumps([scope['server_id'], scope['scope_partition']], ensure_ascii=False, separators=(',', ':'))
    # Preserve the separately specified non-Persona Event ID recipe. The actual
    # Server is also stored and joined independently, and enters CV-366 app keys.
    return 'application' if scope['scope_kind'] == 'application' else 'project:' + scope['project_id']


def partition_contract(scope, partition):
    import base64
    expected = ('app' if scope['scope_kind'] == 'application' else
                'project~' + base64.urlsafe_b64encode(scope['project_id'].encode()).decode().rstrip('='))
    if scope['scope_partition'] != expected or partition != expected:
        raise ValueError('partition')


def stage_contract(name, case, schema):
    """Isolated pre-dispatch boundaries; never claim raw bytes as logical values.

    These are also called by the complete operation/append paths. A missing
    reference has no decodable body, so its availability control belongs at
    transport, rather than claiming it is an otherwise valid logical operation.
    """
    stage = case['stage']
    if stage == 'operation_value_size':
        return operation_value_size(bytes.fromhex(case['body_hex']))
    if stage == 'resolution_value_size':
        return resolution_value_size(bytes.fromhex(case['body_hex']))
    if stage == 'adapter_schema':
        return adapter_contract(case['kind'], case['value'], name)
    if stage == 'transport':
        return transport(bytes.fromhex(case['body_hex']), case['payload_ref'], case['resolved'])
    if stage == 'reference_availability':
        return reference_available(case['payload_ref'], case['resolved'])
    if stage == 'partition':
        return partition_contract(case['scope'], case['scope_partition'])
    if stage == 'payload_schema':
        return payload_contract(name, case['payload'], schema)
    if stage == 'operation_schema':
        if list(Draft202012Validator(schema['$defs'][name.replace('.', '_') + '_operation'],
                                    format_checker=FORMAT).iter_errors(case['value'])):
            raise ValueError('operation_schema')
        return
    raise ValueError('unknown_oracle_stage')


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
        if len(body_bytes) > 16384:
            raise ValueError('inline_body_too_large')
        return
    reference_available(payload_ref, resolved)
    if (resolved['blake3_id'] != blake3(body_bytes).hexdigest()
            or resolved['byte_size'] != len(body_bytes)
            or resolved['media_type'] != 'application/msgpack'
            or bytes.fromhex(resolved['bytes_hex']) != body_bytes):
        raise ValueError('payload_ref_integrity')


def reference_available(payload_ref, resolved):
    if resolved is not None:
        adapter_contract('resolved', resolved)
    if (resolved is None or resolved['ref'] != payload_ref or resolved['durable'] is not True
            or resolved['access_current'] is not True):
        raise ValueError('payload_ref_unavailable')


def append_contract(name, case, schema, original=None):
    """Current append/retry policy; never used to admit historical readers."""
    adapter_contract('record', case)
    e = case['event_record']
    event_record_contract(e)
    if e.get('replay_policy') == 'projector_replay_only':
        raise ValueError('replay_only_not_appendable')
    if e.get('replay_policy') != 'dedupe_by_idempotency_key':
        raise ValueError('writer_replay_policy')
    digest = record_contract(name, case, schema)
    if original is not None:
        if (e['event_id'], e['idempotency_key']) != (
                original['event_record']['event_id'], original['event_record']['idempotency_key']):
            raise ValueError('retry_identity')
        if not same_value(semantic_record(e), semantic_record(original['event_record'])):
            raise ValueError('idempotency_conflict')
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
        payload_contract(name, e['payload'], schema)
    adapter_contract('source', s, name)
    scope = source_scope(s)
    if s['writer_current'] is not True:
        raise ValueError('writer')
    if s['access_current'] is not True:
        raise ValueError('access')
    if not same_value(p, s['frozen_payload']) or not same_value(p['storage_instance_id'], s['storage_instance_id']):
        raise ValueError('original_source_join')
    if name.startswith('auth.github.') and scope['scope_kind'] != 'application':
        raise ValueError('scope')
    partition_contract(scope, case['scope_partition'])
    scope_schema = workflow_scope_schema()
    if list(Draft202012Validator(scope_schema).iter_errors(scope)):
        raise ValueError('scope')
    sk = source_scope_key(s)
    if name.startswith('persona.'):
        persona_semantic(name, p, sk, s)
    else:
        semantic(name, p, sk, e['event_id'], server_id=scope['server_id'])
    eid, idem = identity(name, p, sk, scope['server_id'])
    if e['event_id'] != eid:
        raise ValueError('identity')
    if e['idempotency_key'] != idem:
        raise ValueError('idempotency_key')
    if (e['event_type'] != name or e['payload_schema_id'] != schema['$id'] + '#/$defs/' + name.replace('.', '_')
            or e['occurred_at_utc'] != p['ts'] or e['actor_ref'] != s['actor_ref']
            or e['redaction_profile'] != 'secret_refs_only'
            or e['scope_kind'] != scope['scope_kind'] or e['project_id'] != scope['project_id']
            or e['requested_account_ref'] != s['requested_account_ref']
            or e['effective_account_ref'] != s['effective_account_ref']):
        raise ValueError('envelope_source_join')
    lineage = p.get('runtime_lineage', {})
    for field in ('thread_id', 'run_id', 'node_id', 'attempt_id'):
        if e[field] != lineage.get(field):
            raise ValueError('envelope_source_join')
    body_bytes = binding_bytes(p)  # byte-stage input only, not the SP-278 digest domain
    transport(body_bytes, e['payload_ref'], case['resolved_payload'])
    if not same_value(e['payload'], p if e['payload_ref'] is None else {}):
        raise ValueError('payload_transport_join')
    # This is the adopted generic read-token/storage join, not a new checkpoint.
    token = case['durable_read_token']
    read_schema = durable_token_schema()
    if list(Draft202012Validator(read_schema, format_checker=FORMAT).iter_errors(token)):
        raise ValueError('checkpoint_schema')
    if (token['storage_instance_id'] != p['storage_instance_id']
            or token['source_selection']['storage_instance_id'] != p['storage_instance_id']
            or token['checkpoint_key'] != 'event_record_index_checkpoint.v1:' + p['storage_instance_id']):
        raise ValueError('checkpoint_storage_join')
    return hashlib.sha256(rfc8785.dumps(semantic_record(e))).hexdigest()


def event_record_contract(event):
    envelope = load_plan('Plans/event_record.schema.json')
    if list(Draft202012Validator(envelope, format_checker=FORMAT).iter_errors(event)):
        raise ValueError('event_record_schema')


def expect_failure(call, expected, name, label):
    try:
        call()
    except ValueError as exc:
        assert str(exc) == expected, (name, label, str(exc), expected)
    else:
        raise AssertionError((name, 'accepted negative', label))


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
        op_validator = Draft202012Validator(schema['$defs'][name.replace('.', '_') + '_operation'], format_checker=FORMAT)
        op_validator.validate(operation)
        for field in ('idempotency_key', 'actor_ref'):
            bad_operation = copy.deepcopy(logical)
            bad_operation[field] += '\n'
            assert list(op_validator.iter_errors(bad_operation)), (name, 'operation trailing LF', field)
        withdrawn_policy = {**logical, 'replay_policy': 'projector_replay_only'}
        assert list(op_validator.iter_errors(withdrawn_policy)), (name, 'operation replay-only accepted')
        wrong_key = (name + ':' + '0' * 64 if source_scope(source)['scope_kind'] == 'application'
                     else 'application@1:11:22')
        assert list(op_validator.iter_errors({**logical, 'idempotency_key': wrong_key})), (name, 'wrong operation scope/key')
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
    return {'positive_envelopes': len(row['append_valid']), 'negative_envelopes': len(row['append_invalid']),
            'replay_only_refused': True, 'transport_boundary_bytes': [16383, 16384, 16385],
            'operation_cases': len(row['operation_cases']), 'history_cases': len(row['history_cases']),
            'storage_metadata_retry': 'same_semantic_digest', 'caller_semantic_retry': 'idempotency_conflict'}


def preparation_contract(expected, fixtures, grade, registry, values, schema):
    """Prepared-oracle metadata fences, independent of native admission."""
    if {r['event_type'] for r in fixtures['families']} != expected or len(fixtures['families']) != len(expected):
        raise ValueError('fixture_family_coverage')
    if {r['event_type'] for r in grade['rows']} != expected:
        raise ValueError('grade_family_coverage')
    if not all(r['disposition'] == 'UNDISPOSITIONED' for r in grade['rows']):
        raise ValueError('unadmitted_disposition')
    if expected.intersection(r['event_type'] for r in registry['families']):
        raise ValueError('prepared_membership')
    for name in expected:
        slug = name.replace('.', '_')
        value = next(r for r in values['families'] if r['family_id'] == slug + '_operation')
        if value['retention_policy_ref'] != 'PENDING_RETENTION_DECISION':
            raise ValueError('retention_pending')
        Draft202012Validator.check_schema(value['value_schema'])
        if value['value_schema'] != schema['$defs'][slug + '_operation']:
            raise ValueError('operation_schema_binding')


def run(fixtures_path=None):
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
    results = []
    for row in fixtures['families']:
        name, p = row['event_type'], row['valid']
        slug = name.replace('.', '_')
        validator = Draft202012Validator(schema['$defs'][slug], format_checker=FORMAT)
        validator.validate(p)
        for bad in row['invalid']:
            assert list(validator.iter_errors(bad)), (name, 'accepted negative', bad)
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
            validator.validate(bad)  # schema-valid relational negative
            probes.append(('cadence', lambda: semantic(name, bad, 'application', eid, server_id=server)))
        if name == 'plugin.hook.blocked':
            for hook in ('pre_tool_invoke', 'pre_attempt_start', 'pre_node_dispatch'):
                valid_hook = {**p, 'hook_name': hook}
                validator.validate(valid_hook)
                semantic(name, valid_hook, 'application', eid, server_id=server)
            for hook in ('post_tool_invoke', 'post_attempt_complete'):
                observation = {**p, 'hook_name': hook}
                probes.append(('observation_only_hook',
                               lambda bad=observation: semantic(name, bad, 'application', eid, server_id=server)))
        for reason, call in probes:
            try:
                call()
            except ValueError as exc:
                assert str(exc) == reason, (name, str(exc), reason)
            else:
                raise AssertionError((name, 'accepted semantic negative', reason))
        results.append({'event_type': name, 'payload_negatives': len(row['invalid']),
                        'relational_negatives': len(probes), 'event_id_vector': eid, 'status': 'pass'})
    for row, result in zip(fixtures['families'], results):
        result['append_oracles'] = check_append_contract(row, schema)
    return {'status': 'pass', 'native_execution': 'NOT_RUN',
            'resolved_schema_references': resolved_references, 'rows': results}

if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--fixtures', type=Path, help='Full fixture pack, including adversarial positive mutations.')
    args = parser.parse_args()
    print(json.dumps(run(args.fixtures), indent=2))
