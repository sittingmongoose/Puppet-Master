#!/usr/bin/env python3
"""Static DX contract oracles. Synthetic source predicates are not native proof."""
import copy
import hashlib
import json
from pathlib import Path
from datetime import datetime
import jsonschema
from pm_executor_schema_refs import check_lane_schemas, reference_cases

ROOT = Path(__file__).resolve().parents[1]

def identity(contract, payload, storage_instance_id):
    from pm_executor_event_semantics import canonical, require
    # Apply each identity field's declared domain before making either hash.
    schema = json.loads((ROOT / contract['schema_ref']).read_text())
    for field in contract['identity_fields']:
        value, domain = payload[field], schema['properties'][field]
        require((domain['type'] == 'string' and type(value) is str and len(value) >= domain['minLength'])
                or (domain['type'] == 'integer' and type(value) is int and value >= domain['minimum']),
                'identity declared field domain ' + field)
    require(type(storage_instance_id) is str and bool(storage_instance_id), 'identity Storage string domain')
    inner = canonical([payload[k] for k in contract['identity_fields']])
    digest = lambda value: hashlib.sha256(value.encode('utf-8')).hexdigest()
    return ('executor:' + contract['event_type'] + ':v1:' + digest(inner),
            'evt_executor_' + digest(canonical([storage_instance_id, contract['event_type'], inner])))

def validate(contract, payload, context):
    from pm_executor_event_semantics import schema_validate, validate_append_policy, validate_payload_transport, validate_canonical_domain, same_value
    validate_append_policy(contract, context['envelope']['replay_policy'])
    validate_payload_transport(payload, context['envelope'], context['payload_packs'], context['viewer'])
    validate_canonical_domain(context)
    schema_validate(contract['schema_ref'], payload)
    for field in ('admitted', 'source_refs_valid', 'read_authorized', 'receipt_available', 'predicate_valid'):
        if context[field] is not True:
            raise ValueError(field)
    if context['writer_withdrawn'] is not False or context['deletion_fenced'] is not False:
        raise ValueError('withdrawal/deletion fence')
    if payload['project_id'] != context['current_project_id']:
        raise ValueError('Project join')
    if not same_value(payload.get('replan_generation'), context['current_generation']):
        raise ValueError('generation join')
    for p, c in [('attempt_id', 'expected_attempt_id'), ('blocked_sequence', 'expected_blocked_sequence'),
                 ('remediation_parent_attempt_id', 'expected_parent_attempt_id')]:
        if p in payload and not same_value(payload[p], context[c]):
            raise ValueError(p + ' source join')
    name = contract['event_type']
    proof_schema = json.loads((ROOT / 'Plans/executor_event_source_proofs.schema.json').read_text())
    definition = proof_schema['$defs'][name.replace('.', '_')]
    jsonschema.Draft202012Validator(definition).validate(context['source_facts'])
    for key, value in payload.items():
        if key.endswith('_id') or key in ('blocked_sequence', 'remediation_generation', 'replan_generation', 'runtime_snapshot_ref'):
            if not same_value(context['source_bindings'].get(key), value):
                raise ValueError('canonical source binding: ' + key)
    for key in ('project_id', 'run_id', 'thread_id', 'attempt_id'):
        if key in payload and not same_value(context['envelope'].get(key), payload[key]):
            raise ValueError('envelope binding: ' + key)
    if name == 'node.completed':
        expected = 'verified' if payload['result_outcome'] == 'done' else 'verify_pending'
        if context['source_facts']['node_state'] != expected:
            raise ValueError('node completion source state')
    if name == 'remediation.resolved' and payload['resolution'] == 'fixed' and context['source_child_success'] is not True:
        raise ValueError('fixed without child success')
    if name == 'remediation.spawned' and payload['child_attempt_id'] == payload['remediation_parent_attempt_id']:
        raise ValueError('child is parent')
    if name == 'run.node_backoff_started' and datetime.fromisoformat(payload['backoff_until_utc']) < datetime.fromisoformat(payload['ts']):
        raise ValueError('backoff before recorded observation')
    if name == 'plan.decomposition_degraded' and context['graph_locked'] is not False:
        raise ValueError('graph already locked')
    if name == 'run.completed' and context['packaging_passed'] is not True:
        raise ValueError('Document Set packaging')
    if name == 'run.node_backoff_expired' and datetime.fromisoformat(context['now_utc']) < datetime.fromisoformat(context['backoff_until_utc']):
        raise ValueError('backoff not elapsed')
    if name in ('run.node_backoff_started', 'run.node_retry_scheduled') and payload['failure_class'] in ('graph_integrity', 'verification_failed', 'reviewer_findings', 'quota_exceeded'):
        raise ValueError('non-retryable failure')
    if name == 'attempt.completed':
        if (payload['terminal_state'] == 'done') != payload.get('success', False):
            raise ValueError('terminal success/failure mismatch')
    if name == 'node.blocked' and payload.get('requires_safe_point_restore'):
        if not payload.get('safe_point_id') or not payload.get('anchor_ref'):
            raise ValueError('missing restore anchor')
    if name == 'scheduler.pass':
        ready = payload['ready_nodes']
        ready_ids = [p['node_id'] for p in ready]
        selected = [p['node_id'] for p in payload['selected_nodes']]
        excluded = [p['node_id'] for p in payload['non_selected_nodes']]
        if len(set(ready_ids)) != len(ready_ids) or len(set(selected + excluded)) != len(selected + excluded):
            raise ValueError('duplicate node')
        if set(selected + excluded) != set(ready_ids) or len(selected) > payload['available_slots']:
            raise ValueError('capacity/partition')
        ranks = {'remediation': 3, 'unblocker': 2, 'normal': 1}
        ordered = sorted(ready, key=lambda p: (-ranks[p['scheduler_lane']], -p['manual_priority'], -p['transitive_unblock_count'], p['ready_since_utc'], p['node_id']))
        if selected != [p['node_id'] for p in ordered[:len(selected)]]:
            raise ValueError('selection order')
        by_id = {p['node_id']: p for p in ready}
        for p in payload['selected_nodes']:
            if p['score_tuple'] != by_id[p['node_id']] or p['lane'] != p['score_tuple']['scheduler_lane']:
                raise ValueError('score join')
    return True

def main(family_name=None):
    from pm_executor_event_semantics import expand_fixture_literals, mutate, fixture_encoding, digest
    contracts = json.loads((ROOT / 'Plans/executor_event_contracts.json').read_text())['families']
    registry = json.loads((ROOT / 'Plans/event_family_registry.json').read_text())
    existing = {f['event_type'] for f in registry['families']}
    assert len(contracts) == 16 and len({c['event_type'] for c in contracts}) == 16
    if family_name is not None:
        contracts = [contract for contract in contracts if contract['event_type'] == family_name]
        if not contracts:
            raise SystemExit('unknown Executor family ' + family_name)
    failures = check_lane_schemas(contracts)
    if failures:
        print(json.dumps({'status': 'fail', 'schema_reference_failures': failures, 'native_execution': 'NOT_RUN'}, indent=2))
        return 1
    selected = {contract['event_type'] for contract in contracts}
    fixtures = expand_fixture_literals([case for case in json.loads((ROOT / 'Plans/executor_event_contract_fixtures.json').read_text())['cases']
                                        if case['event_type'] in selected])
    ref_fixtures = json.loads((ROOT / 'Plans/executor_event_schema_reference_fixtures.json').read_text())['families']
    ref_cases = 0
    for c in contracts:
        failures.extend(reference_cases(c, ref_fixtures[c['event_type']]))
        ref_cases += len(ref_fixtures[c['event_type']])
        assert c['event_type'] not in existing, 'Draft must remain unadmitted'
        schema = json.loads((ROOT / c['schema_ref']).read_text())
        jsonschema.Draft202012Validator.check_schema(schema)
        assert schema['additionalProperties'] is False
        cases = [x for x in fixtures if x['event_type'] == c['event_type']]
        assert any(x['expected'] == 'accept' for x in cases)
        assert any(x['expected'] == 'reject' for x in cases)
        for case in cases:
            if 'seed' in case:
                seed = case['seed']
                validate(c, seed['payload'], seed['context'])
                rebuilt = mutate(seed, case['defect_changes'])
                assert fixture_encoding([rebuilt['payload'], rebuilt['context']]) == fixture_encoding([case['payload'], case['context']]), case['case']
            try:
                validate(c, case['payload'], case['context'])
                result = 'accept'
            except (ValueError, jsonschema.ValidationError):
                result = 'reject'
            if result != case['expected']:
                failures.append((c['event_type'], case['case'], result))
        # Real dedupe algorithm checks: metadata cannot mint a second transition.
        p = copy.deepcopy(cases[0]['payload'])
        ident = identity(c, p, 'store-001')
        q = copy.deepcopy(p); q['ts'] = '2026-11-04T13:00:00Z'
        assert identity(c, q, 'store-001') == ident
        q['event_sequence'] += 1
        assert identity(c, q, 'store-001') != ident
        assert identity(c, p, 'store-002')[1] != ident[1]
        original_digest = digest(p)
        stored = {ident: (original_digest, 'original-first-receipt')}
        assert stored[identity(c, p, 'store-001')][1] == 'original-first-receipt'
        q = copy.deepcopy(p); q['ts'] = '2026-11-04T13:00:00Z'
        assert identity(c, q, 'store-001') in stored
        assert digest(q) != stored[ident][0]
    print(json.dumps({'status': 'fail' if failures else 'pass', 'families': len(contracts), 'fixture_cases': len(fixtures), 'identity_replay_cases': len(contracts)*5, 'schema_reference_cases': ref_cases, 'failures': failures, 'native_execution': 'NOT_RUN'}, indent=2))
    return bool(failures)

if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--family', help='Check one family in a memory-bounded process; default checks all.')
    raise SystemExit(main(parser.parse_args().family))
