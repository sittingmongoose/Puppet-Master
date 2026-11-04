#!/usr/bin/env python3
"""Static DG6B contract oracles; no native execution or admission."""
import copy
import datetime
import hashlib
import json
from functools import cache
from pathlib import Path
from jsonschema import Draft202012Validator, FormatChecker
ROOT = Path(__file__).resolve().parents[1]


@cache
def load_plan(path):
    return json.loads((ROOT / path).read_text())


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
    return {'schema_id': 'pm.storage_value.' + name.replace('.', '_') + '_operation.v1',
            'schema_version': '1.0.0', 'event_type': name, 'scope_key': source_scope_key(source),
            'server_id': source_scope(source)['server_id'], 'actor_ref': source['actor_ref'],
            'payload': p, 'state': 'effect_committed',
            'effect_receipt_ref': p.get('owner_result_ref', p.get('plugin_receipt_ref', 'ref:result/auth')),
            'event_id': event['event_id'], 'idempotency_key': event['idempotency_key'],
            'replay_policy': event['replay_policy']}


def store_operation(logical, force_reference=False):
    """SP-337 physical value: complete logical operation or closed reference."""
    from blake3 import blake3
    from pm_event_index_binding import binding_bytes
    body = binding_bytes(logical)
    if len(body) <= 16384 and not force_reference:
        return copy.deepcopy(logical), None
    digest = blake3(body).hexdigest()
    value = {key: logical[key] for key in ('schema_id', 'schema_version', 'event_type')}
    value['payload_ref'] = {'blake3_id': digest, 'byte_size': len(body), 'media_type': 'application/msgpack'}
    resolved = {'ref': 'ref:payload/' + digest, **value['payload_ref'], 'bytes_hex': body.hex(),
                'durable': True, 'access_current': True}
    return value, resolved


def operation_contract(name, value, resolved, expected, schema):
    import msgpack
    from pm_event_index_binding import binding_bytes
    if len(binding_bytes(value)) > 16384:
        raise ValueError('operation_value_too_large')
    definition = schema['$defs'][name.replace('.', '_') + '_operation']
    if list(Draft202012Validator(definition, format_checker=FORMAT).iter_errors(value)):
        raise ValueError('operation_schema')
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
    if logical != expected:
        raise ValueError('operation_source_join')
    return logical


def history_contract(name, case, schema):
    """Validate immutable at-write custody; current live state is not history.

    Original source evidence remains frozen. live_state describes subsequent
    disconnect/update/delete/CAS/selection state and never grants read access.
    """
    if not case['retained'] or not case['authentic'] or not case['admitted_when_written']:
        raise ValueError('historical_provenance')
    if case['family_withdrawn'] or not case['reader_current']:
        raise ValueError('historical_withdrawn')
    if not case['access_current'] or case['body_deleted']:
        raise ValueError('historical_access')
    # This is the original admission evidence, never the current writer lease.
    return append_contract(name, case['original'], schema)

def identity(name, payload, scope_key, server_id=None):
    preimage = [name, payload['storage_instance_id'], scope_key, payload['operation_id'], payload['revision']]
    digest = hashlib.sha256(json.dumps(preimage, ensure_ascii=False, separators=(',', ':')).encode()).hexdigest()
    scope = payload.get('scope')
    application = scope['scope_kind'] == 'application' if scope else scope_key == 'application'
    if application:
        server_id = scope['server_id'] if scope else server_id
        if not server_id:
            raise ValueError('original_server_required')
        key = 'application@1:' + server_id.encode().hex() + ':' + payload['operation_id'].encode().hex()
    else:
        key = name + ':' + digest
    return 'evt_' + name.replace('.', '_') + '_' + digest, key

def semantic(name, payload, scope_key, event_id, original=None, server_id=None):
    if name.startswith('auth.github.') and scope_key != 'application':
        raise ValueError('scope')
    if identity(name, payload, scope_key, server_id)[0] != event_id:
        raise ValueError('identity')
    if original is not None and original != payload:
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
    if not isinstance(value, str) or not value.endswith("Z"):
        return False
    datetime.datetime.fromisoformat(value[:-1] + "+00:00")
    return True

def persona_scope_key(payload):
    return json.dumps([payload['scope']['server_id'], payload['scope']['scope_partition']],
                      ensure_ascii=False, separators=(',', ':'))


def persona_semantic(name, payload, scope_key, source):
    """Static original-source oracle; not native authorization or source proof."""
    import base64
    p, s = payload, source
    scope = p['scope']
    if persona_scope_key(p) != scope_key or scope != s['request']['scope']:
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
    if not s['access_current']:
        raise ValueError('access')
    # Event-writer admission is independent of the definition-write lease.
    if not s['writer_current']:
        raise ValueError('writer')
    if name != 'persona.exported' and not s['definition_writer_current']:
        raise ValueError('definition_writer')
    if name in ('persona.created', 'persona.deleted', 'persona.imported', 'persona.updated'):
        if s['computer_mirror']:
            raise ValueError('mirror')
        if s['protected_id']:
            raise ValueError('protected')
    if name == 'persona.deleted' and not s['confirmation_current']:
        raise ValueError('confirmation')
    if name in ('persona.deleted', 'persona.updated', 'persona.imported') and not s['cas_current']:
        raise ValueError('cas')
    if name == 'persona.imported' and not s['source_verified']:
        raise ValueError('source_trust')
    if name == 'persona.selected' and scope['scope_kind'] == 'application' and not s['reach_allows_no_project']:
        raise ValueError('reach')
    request, result = s['request'], s['result']
    if p != s['frozen_payload'] or p['owner_request_ref'] != s['owner_request_ref']:
        raise ValueError('original_source_join')
    for key in ('command_id', 'scope', 'client_id', 'persona_id', 'source_id', 'source_revision',
                'source_sha256', 'project_version_id', 'reach_ref', 'expected_owner_revision', 'return_context_ref'):
        if p[key] != request[key]:
            raise ValueError('original_source_join')
    for payload_key, result_key in [('command_id', 'command_id'), ('operation_id', 'operation_id'),
            ('persona_id', 'persona_id'), ('revision', 'owner_revision'), ('content_sha256', 'content_sha256'),
            ('result_status', 'status'), ('owner_result_ref', 'owner_result_ref'),
            ('owner_readback_ref', 'readback_ref'), ('return_context_ref', 'return_context_ref')]:
        if p[payload_key] != result[result_key]:
            raise ValueError('original_source_join')
    if p['storage_instance_id'] != s['storage_instance_id'] or p['home_ref'] != request['destination_home_ref']:
        raise ValueError('original_source_join')
    if p['content_sha256'] != request['whole_record_sha256']:
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
        if lineage != s['resolution']['runtime_lineage']:
            raise ValueError('original_source_join')
        for key in ('requested_persona', 'effective_persona', 'persona_selection_source', 'selection_reason',
                    'persona_override_scope', 'persona_override_owner_id', 'runtime_snapshot_ref', 'runtime_snapshot_sha256'):
            if p[key] != s['resolution'][key]:
                raise ValueError('original_source_join')
        for key in ('operation_id', 'persona_id', 'owner_result_ref', 'selection_target_ref'):
            if p[key] != s['resolution'][key]:
                raise ValueError('original_source_join')


def check_persona(row, schema):
    from referencing import Registry, Resource
    name, p = row['event_type'], row['valid']
    slug = name.replace('.', '_')
    shared = json.loads((ROOT / 'Plans/shared_integration_runtime.schema.json').read_text())
    resource = Resource.from_contents(shared)
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
            Draft202012Validator(ref, registry=registry, format_checker=FORMAT).validate(source[kind])
        if name == 'persona.selected':
            Draft202012Validator(schema['$defs']['persona_selected_resolution']).validate(source['resolution'])
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
        result_validator = Draft202012Validator(shared['$defs']['persona_select_result_v2'], registry=registry)
        original = row['source']['result']
        for alias in ('requested_persona_id', 'effective_persona_id'):
            assert list(result_validator.iter_errors({**original, alias: 'forbidden'}))
        resolution_validator = Draft202012Validator(schema['$defs']['persona_selected_resolution'])
        resolution = row['source']['resolution']
        for alias in ('requested_persona_id', 'effective_persona_id'):
            assert list(resolution_validator.iter_errors({**resolution, alias: 'forbidden'}))
        for key in ('requested_persona', 'effective_persona', 'runtime_snapshot_ref', 'runtime_snapshot_sha256'):
            assert list(resolution_validator.iter_errors({k: v for k, v in resolution.items() if k != key}))
    return {'event_type': name, 'status': 'pass', 'payload_negatives': len(row['invalid']),
            'relational_negatives': len(row['semantic_invalid']), 'positive_variants': len(variants),
            'event_id_vector': eid, 'native_execution': 'NOT_RUN'}


def source_scope(source):
    return source['request']['scope'] if 'request' in source else source['scope']


def source_scope_key(source):
    scope = source_scope(source)
    if 'request' in source:
        return json.dumps([scope['server_id'], scope['scope_partition']], ensure_ascii=False, separators=(',', ':'))
    # Preserve the separately specified non-Persona Event ID recipe. The actual
    # Server is also stored and joined independently, and enters CV-366 app keys.
    return 'application' if scope['scope_kind'] == 'application' else 'project:' + scope['project_id']


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
    if (resolved is None or resolved['ref'] != payload_ref or not resolved['durable']
            or not resolved['access_current']):
        raise ValueError('payload_ref_unavailable')
    if (resolved['blake3_id'] != blake3(body_bytes).hexdigest()
            or resolved['byte_size'] != len(body_bytes)
            or resolved['media_type'] != 'application/msgpack'
            or bytes.fromhex(resolved['bytes_hex']) != body_bytes):
        raise ValueError('payload_ref_integrity')


def append_contract(name, case, schema, original=None):
    import base64
    import rfc8785
    from pm_event_index_binding import binding_bytes
    p, s, e = case['payload'], case['source'], case['event_record']
    if e.get('replay_policy') == 'projector_replay_only':
        raise ValueError('replay_only_not_appendable')
    if e.get('replay_policy') != 'dedupe_by_idempotency_key':
        raise ValueError('writer_replay_policy')
    envelope = load_plan('Plans/event_record.schema.json')
    if list(Draft202012Validator(envelope, format_checker=FORMAT).iter_errors(e)):
        raise ValueError('event_record_schema')
    if list(Draft202012Validator(schema['$defs'][name.replace('.', '_')],
                               format_checker=FORMAT).iter_errors(p)):
        raise ValueError('payload_schema')
    scope = source_scope(s)
    if not s['writer_current']:
        raise ValueError('writer')
    if not s['access_current']:
        raise ValueError('access')
    if p != s['frozen_payload'] or p['storage_instance_id'] != s['storage_instance_id']:
        raise ValueError('original_source_join')
    if name.startswith('auth.github.') and scope['scope_kind'] != 'application':
        raise ValueError('scope')
    expected_partition = ('app' if scope['scope_kind'] == 'application' else
        'project~' + base64.urlsafe_b64encode(scope['project_id'].encode()).decode().rstrip('='))
    if scope['scope_partition'] != expected_partition or case['scope_partition'] != expected_partition:
        raise ValueError('partition')
    scope_schema = load_plan('Plans/shared_integration_runtime.schema.json')['$defs']['WorkflowScopeV2']
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
    if e['payload'] != (p if e['payload_ref'] is None else {}):
        raise ValueError('payload_transport_join')
    # This is the adopted generic read-token/storage join, not a new checkpoint.
    token = case['durable_read_token']
    read_schema = strict_patterns(load_plan('Plans/event_record_index_checkpoint.schema.json')['$defs']['read_token'])
    read_schema['required'].remove('redb_snapshot_id')
    del read_schema['properties']['redb_snapshot_id']  # DL-076: live-only, never durable
    if list(Draft202012Validator(read_schema, format_checker=FORMAT).iter_errors(token)):
        raise ValueError('checkpoint_schema')
    if (token['storage_instance_id'] != p['storage_instance_id']
            or token['source_selection']['storage_instance_id'] != p['storage_instance_id']
            or token['checkpoint_key'] != 'event_record_index_checkpoint.v1:' + p['storage_instance_id']):
        raise ValueError('checkpoint_storage_join')
    digest = hashlib.sha256(rfc8785.dumps(semantic_record(e))).hexdigest()
    if original is not None:
        if (e['event_id'], e['idempotency_key']) != (
                original['event_record']['event_id'], original['event_record']['idempotency_key']):
            raise ValueError('retry_identity')
        if semantic_record(e) != semantic_record(original['event_record']):
            raise ValueError('idempotency_conflict')
    return digest


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


def run(fixtures_path=None):
    schema = json.loads((ROOT / 'Plans/dg6b_event_contracts.schema.json').read_text())
    resolved_references = resolve_schema_graph(schema)
    fixtures = json.loads((fixtures_path or ROOT / 'Plans/dg6b_event_contract_fixtures.json').read_text())
    expected = {'auth.github.authenticated', 'auth.github.device_code.issued', 'auth.github.disconnected',
                'auth.github.failed', 'auth.github.token.polling', 'plugin.hook.blocked', 'plugin.hook.error',
                'plugin.hook.invoked', 'plugin.load_failed', 'plugin.loaded', 'plugin.permission.override',
                'plugin.tool.collision', 'plugin.tool.registered', 'persona.created', 'persona.deleted',
                'persona.exported', 'persona.imported', 'persona.selected', 'persona.updated'}
    assert {r['event_type'] for r in fixtures['families']} == expected
    assert len(fixtures['families']) == len(expected)
    grade = load_plan('reports/event-authority-20261104/DG6B.self-grade.json')
    assert {r['event_type'] for r in grade['rows']} == expected
    assert all(r['disposition'] == 'UNDISPOSITIONED' for r in grade['rows']), 'unadmitted_disposition'
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
            probes.append(('scope', lambda: semantic(name, p, 'project:other', eid)))
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
    # Prepared contract gate must not be confused with event registry membership.
    registry = json.loads((ROOT / 'Plans/event_family_registry.json').read_text())
    assert not expected.intersection(r['event_type'] for r in registry['families'])
    values = json.loads((ROOT / 'Plans/storage_value_registry.json').read_text())
    for name in expected:
        slug = name.replace('.', '_')
        value = next(r for r in values['families'] if r['family_id'] == slug + '_operation')
        assert value['retention_policy_ref'] == 'PENDING_RETENTION_DECISION'
        Draft202012Validator.check_schema(value['value_schema'])
        assert value['value_schema'] == schema['$defs'][slug + '_operation']
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
