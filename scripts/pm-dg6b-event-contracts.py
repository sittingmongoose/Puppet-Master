#!/usr/bin/env python3
"""Static DG6B contract oracles; no native execution or admission."""
import copy
import datetime
import hashlib
import json
from pathlib import Path
from jsonschema import Draft202012Validator, FormatChecker
ROOT = Path(__file__).resolve().parents[1]

def identity(name, payload, scope_key):
    preimage = [name, payload['storage_instance_id'], scope_key, payload['operation_id'], payload['revision']]
    digest = hashlib.sha256(json.dumps(preimage, ensure_ascii=False, separators=(',', ':')).encode()).hexdigest()
    return 'evt_' + name.replace('.', '_') + '_' + digest, name + ':' + digest

def semantic(name, payload, scope_key, event_id, original=None):
    if name.startswith('auth.github.') and scope_key != 'application':
        raise ValueError('scope')
    if identity(name, payload, scope_key)[0] != event_id:
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
    if name != 'persona.exported' and not s['writer_current']:
        raise ValueError('writer')
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
                     'event_id': veid, 'idempotency_key': videm}
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


def run():
    schema = json.loads((ROOT / 'Plans/dg6b_event_contracts.schema.json').read_text())
    fixtures = json.loads((ROOT / 'Plans/dg6b_event_contract_fixtures.json').read_text())
    expected = {'auth.github.authenticated', 'auth.github.device_code.issued', 'auth.github.disconnected',
                'auth.github.failed', 'auth.github.token.polling', 'plugin.hook.blocked', 'plugin.hook.error',
                'plugin.hook.invoked', 'plugin.load_failed', 'plugin.loaded', 'plugin.permission.override',
                'plugin.tool.collision', 'plugin.tool.registered', 'persona.created', 'persona.deleted',
                'persona.exported', 'persona.imported', 'persona.selected', 'persona.updated'}
    assert {r['event_type'] for r in fixtures['families']} == expected
    assert len(fixtures['families']) == len(expected)
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
        eid, idem = identity(name, p, 'application')
        assert (eid, idem) == (row['expected_event_id'], row['expected_idempotency_key'])
        semantic(name, p, 'application', eid)
        semantic(name, copy.deepcopy(p), 'application', eid, original=p)
        assert identity(name, copy.deepcopy(p), 'application') == (eid, idem)
        probes = [('identity', lambda: semantic(name, p, 'application', 'other'))]
        changed = {**p, 'ts': '2026-11-04T12:01:00Z'}
        probes.append(('original_payload_conflict', lambda: semantic(name, changed, 'application', eid, original=p)))
        if name.startswith('auth.'):
            probes.append(('scope', lambda: semantic(name, p, 'project:other', eid)))
        else:
            # Same operation in another source scope cannot have the original identity.
            probes.append(('identity', lambda: semantic(name, p, 'project:other', eid)))
        if name == 'auth.github.token.polling':
            bad = {**p, 'poll_interval_seconds': p['previous_interval_seconds']}
            validator.validate(bad)  # schema-valid relational negative
            probes.append(('cadence', lambda: semantic(name, bad, 'application', eid)))
        if name == 'plugin.hook.blocked':
            for hook in ('pre_tool_invoke', 'pre_attempt_start', 'pre_node_dispatch'):
                valid_hook = {**p, 'hook_name': hook}
                validator.validate(valid_hook)
                semantic(name, valid_hook, 'application', eid)
            for hook in ('post_tool_invoke', 'post_attempt_complete'):
                observation = {**p, 'hook_name': hook}
                probes.append(('observation_only_hook',
                               lambda bad=observation: semantic(name, bad, 'application', eid)))
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
    return {'status': 'pass', 'native_execution': 'NOT_RUN', 'rows': results}

if __name__ == '__main__':
    print(json.dumps(run(), indent=2))
