#!/usr/bin/env python3
"""Static DMEM contracts and synthetic oracles. No native execution or admission."""
from pathlib import Path
import hashlib
import json
from jsonschema import Draft202012Validator, FormatChecker
ROOT = Path(__file__).resolve().parents[1]

def load(path):
    return json.loads((ROOT / path).read_text())

def identity(event_type, instance, project, operation):
    raw = json.dumps(['pm.memory.maintenance.event.v1', instance, project, operation, event_type],
                     ensure_ascii=False, separators=(',', ':')).encode('utf-8')
    digest = hashlib.sha256(raw).hexdigest()
    return 'evt_mem_' + digest, 'memory-maintenance:' + digest

def accept(payload, contract, context):
    """Synthetic boundary predicates, not a producer or Storage adapter."""
    schema = load('Plans/memory_maintenance_event_payloads.schema.json')
    definition = schema['$defs'][contract['event_type'].replace('.', '_')]
    if list(Draft202012Validator(definition, format_checker=FormatChecker()).iter_errors(payload)):
        return False
    if not payload['occurred_at_utc'].endswith('Z'):
        return False
    if not context['admitted'] or context['withdrawn'] or not context['permission']:
        return False
    if payload['project_id'] != context['project_id'] or payload['operation_id'] != context['operation_id']:
        return False
    if payload['source_revision_sha256'] != context['source_revision_sha256']:
        return False
    if not context['request_matches'] or not context['current_source']:
        return False
    if payload['event_type'].endswith('.completed'):
        return (context['started_receipt'] and context['effect_settled'] and context['original_full_value']
                and payload['started_event_id'] == context['started_event_id'])
    return context['acceptance_durable']

def main():
    contracts = load('Plans/memory_maintenance_contracts.json')
    fixtures = load('Plans/memory_maintenance_event_fixtures.json')
    registry = load('Plans/event_family_registry.json')
    registered = {x['event_type'] for x in registry['families']}
    assert len(contracts['families']) == 8 and len(contracts['blocked_rows']) == 4
    assert not registered.intersection(x['event_type'] for x in contracts['families'])
    payloads = load('Plans/memory_maintenance_event_payloads.schema.json')
    operations = load('Plans/memory_maintenance_operation.schema.json')
    Draft202012Validator.check_schema(payloads)
    Draft202012Validator.check_schema(operations)
    families = {x['event_type']: x for x in contracts['families']}
    counts = {}
    for case in fixtures['cases']:
        event = case['event_type']; contract = families[event]
        result = accept(case['payload'], contract, case['context'])
        assert result == case['accepted'], case['name']
        counts[event] = counts.get(event, 0) + 1
        if case.get('retry'):
            args = (event, 'storage-1', case['payload']['project_id'], case['payload']['operation_id'])
            assert identity(*args) == tuple(case["expected_identity"])
            assert identity(*args) != identity(event, 'storage-2', args[2], args[3])
            assert identity(*args) != identity(event, args[1], 'other-project', args[3])
    assert set(counts) == set(families)
    values = load('Plans/storage_value_registry.json')['families']
    new_values = [v for v in values if v['family_id'].startswith('memory_') and v['family_id'].endswith('_operation')]
    assert len(new_values) == 4
    for value in new_values:
        assert value['retention_policy_ref'] == 'PENDING_RETENTION_DECISION'
        assert value['status'] == 'deferred_not_build_blocking'
        assert value['value_schema'] in operations['$defs'].values()
    for contract in families.values():
        assert contract['membership'] == 'ABSENT'
        assert contract['retention_policy_ref'] == 'PENDING_RETENTION_DECISION'
        for path in [contract['semantic_owner'], contract['storage_owner'], contract['payload_owner']]:
            filename, unit = path.split('#')
            assert 'plan_unit_id: ' + unit in (ROOT / filename).read_text()
        storage = (ROOT / contract['storage_owner'].split('#')[0]).read_text()
        unit = contract['storage_owner'].split('#')[1]
        section = storage.split('### '+unit+' - ', 1)[1].split('\n### ', 1)[0]
        for token in ['SP-278', 'SP-286', 'CV-339', contract['consumer_id'], contract['event_type']]:
            assert token in section
    print(json.dumps({'status': 'pass', 'families': counts, 'cases': len(fixtures['cases']),
                      'native': 'NOT_RUN', 'admission': 'ABSENT',
                      'retention': 'PENDING_RETENTION_DECISION'}, indent=2))
if __name__ == '__main__':
    main()
