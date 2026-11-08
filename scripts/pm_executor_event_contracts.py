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
NON_RETRYABLE = ('graph_integrity', 'verification_failed', 'reviewer_findings', 'quota_exceeded')


def identity(contract, payload, storage_instance_id):
    from pm_executor_event_semantics import canonical, refuse, tname
    # Apply each identity field's declared domain before making either hash.
    schema = json.loads((ROOT / contract['schema_ref']).read_text())
    for field in contract['identity_fields']:
        value, domain = payload[field], schema['properties'][field]
        kind = domain.get('type')
        bound = (domain['minLength'] if kind == 'string' and type(value) is str
                 else domain['minimum'] if kind == 'integer' and type(value) is int else None)
        refuse('identity_field', {
            'domain_type': copy.deepcopy(kind), 'value_type': tname(value),
            'length': len(value) if type(value) is str else None,
            'number': value if type(value) is int else None, 'bound': bound}, ' ' + field)
    refuse('identity_storage', {'storage_type': tname(storage_instance_id),
                                'storage_nonempty': type(storage_instance_id) is str and bool(storage_instance_id)})
    inner = canonical([payload[k] for k in contract['identity_fields']])
    digest = lambda value: hashlib.sha256(value.encode('utf-8')).hexdigest()
    return ('executor:' + contract['event_type'] + ':v1:' + digest(inner),
            'evt_executor_' + digest(canonical([storage_instance_id, contract['event_type'], inner])))


def validate(contract, payload, context):
    from pm_executor_event_semantics import (schema_validate, validate_append_policy, validate_payload_transport,
                                             validate_canonical_domain, canonical, instant, refuse, q)
    validate_append_policy(contract, context['envelope']['replay_policy'])
    validate_payload_transport(payload, context['envelope'], context['payload_packs'], context['viewer'])
    validate_canonical_domain(context)
    schema_validate(contract['schema_ref'], payload)
    flags = ('admitted', 'source_refs_valid', 'read_authorized', 'receipt_available', 'predicate_valid')
    refuse('shape_flags', {field: copy.deepcopy(context[field]) for field in flags})
    refuse('shape_fences', {'writer_withdrawn': copy.deepcopy(context['writer_withdrawn']),
                            'deletion_fenced': copy.deepcopy(context['deletion_fenced'])})
    refuse('shape_joins', {'payload_project': payload['project_id'], 'current_project': copy.deepcopy(context['current_project_id']),
                           'payload_generation_canonical': canonical(payload.get('replan_generation')),
                           'current_generation_canonical': canonical(context['current_generation'])})
    for p, c in [('attempt_id', 'expected_attempt_id'), ('blocked_sequence', 'expected_blocked_sequence'),
                 ('remediation_parent_attempt_id', 'expected_parent_attempt_id')]:
        if p in payload:
            refuse('shape_source_field', {'payload_canonical': canonical(payload[p]), 'expected_canonical': canonical(context[c])},
                   message=p + ' source join')
    name = contract['event_type']
    proof_schema = json.loads((ROOT / 'Plans/executor_event_source_proofs.schema.json').read_text())
    definition = proof_schema['$defs'][name.replace('.', '_')]
    error = next(iter(jsonschema.Draft202012Validator(definition).iter_errors(context['source_facts'])), None)
    refuse('source_facts_schema', {'schema_valid': error is None}, '' if error is None else ': ' + error.message)
    for key, value in payload.items():
        if key.endswith('_id') or key in ('blocked_sequence', 'remediation_generation', 'replan_generation', 'runtime_snapshot_ref'):
            refuse('shape_binding', {'binding_canonical': canonical(context['source_bindings'].get(key)),
                                     'payload_canonical': canonical(value)}, ' ' + key)
    for key in ('project_id', 'run_id', 'thread_id', 'attempt_id'):
        if key in payload:
            refuse('shape_envelope', {'envelope_canonical': canonical(context['envelope'].get(key)),
                                      'payload_canonical': canonical(payload[key])}, ' ' + key)
    facts = {'family': name, 'node_state': None, 'expected_node_state': None, 'fixed': None, 'child_success': None,
             'child': None, 'parent': None, 'until': None, 'ts': None, 'graph_locked': None, 'packaging_passed': None,
             'now': None, 'context_until': None}
    if name == 'node.completed':
        facts['node_state'] = copy.deepcopy(context['source_facts']['node_state'])
        facts['expected_node_state'] = 'verified' if payload['result_outcome'] == 'done' else 'verify_pending'
    if name == 'remediation.resolved':
        facts['fixed'] = payload['resolution'] == 'fixed'
        facts['child_success'] = copy.deepcopy(context['source_child_success']) if facts['fixed'] else None
    if name == 'remediation.spawned':
        facts['child'], facts['parent'] = payload['child_attempt_id'], payload['remediation_parent_attempt_id']
    if name == 'run.node_backoff_started':
        facts['until'], facts['ts'] = q(instant(payload['backoff_until_utc'])), q(instant(payload['ts']))
    if name == 'plan.decomposition_degraded':
        facts['graph_locked'] = copy.deepcopy(context['graph_locked'])
    if name == 'run.completed':
        facts['packaging_passed'] = copy.deepcopy(context['packaging_passed'])
    if name == 'run.node_backoff_expired':
        facts['now'] = q(instant(context['now_utc'], utc=True))
        facts['context_until'] = q(instant(context['backoff_until_utc'], utc=True))
    refuse('shape_family', facts)
    restore = name == 'node.blocked' and bool(payload.get('requires_safe_point_restore'))
    refuse('shape_family_b', {
        'family': name, 'retry_family': name in ('run.node_backoff_started', 'run.node_retry_scheduled'),
        'failure_class': payload.get('failure_class') if name in ('run.node_backoff_started', 'run.node_retry_scheduled') else None,
        'terminal_done': payload['terminal_state'] == 'done' if name == 'attempt.completed' else None,
        'success': copy.deepcopy(payload.get('success', False)) if name == 'attempt.completed' else None,
        'restore_required': restore, 'safe_point_present': bool(payload.get('safe_point_id')) if restore else None,
        'anchor_present': bool(payload.get('anchor_ref')) if restore else None})
    if name == 'scheduler.pass':
        ready = payload['ready_nodes']
        ready_ids = [p['node_id'] for p in ready]
        selected = [p['node_id'] for p in payload['selected_nodes']]
        excluded = [p['node_id'] for p in payload['non_selected_nodes']]
        ranks = {'remediation': 3, 'unblocker': 2, 'normal': 1}
        ready_unique = len(set(ready_ids)) == len(ready_ids)
        partition_unique = len(set(selected + excluded)) == len(selected + excluded)
        partitioned = ready_unique and partition_unique and set(selected + excluded) == set(ready_ids)
        ordered = (sorted(ready, key=lambda p: (-ranks[p['scheduler_lane']], -p['manual_priority'], -p['transitive_unblock_count'],
                                                instant(p['ready_since_utc']), p['node_id']))
                   if partitioned and len(selected) <= payload['available_slots'] else None)
        refuse('shape_scheduler', {
            'ready_unique': ready_unique, 'partition_unique': partition_unique,
            'ready_ids': sorted(set(ready_ids)), 'partition_ids': sorted(set(selected + excluded)),
            'selected_count': len(selected), 'available_slots': payload['available_slots'], 'selected_ids': selected,
            'ordered_ids': [p['node_id'] for p in ordered[:len(selected)]] if ordered is not None else selected})
        by_id = {p['node_id']: p for p in ready}
        for p in payload['selected_nodes']:
            refuse('shape_scheduler_selected', {'score_tuple': copy.deepcopy(p['score_tuple']), 'ready_tuple': copy.deepcopy(by_id[p['node_id']]),
                                                'lane': copy.deepcopy(p['lane']),
                                                'tuple_lane': copy.deepcopy(p['score_tuple']['scheduler_lane'])
                                                if type(p['score_tuple']) is dict and 'scheduler_lane' in p['score_tuple'] else None})
    return True


def identity_replay_facts(contract, payload):
    """Real dedupe algorithm checks: metadata cannot mint a second transition."""
    from pm_executor_event_semantics import digest
    ident = identity(contract, payload, 'store-001')
    metadata = copy.deepcopy(payload)
    metadata['ts'] = '2026-11-04T13:00:00Z'
    sequence = copy.deepcopy(metadata)
    sequence['event_sequence'] += 1
    stored = {ident: (digest(payload), 'original-first-receipt')}
    return {
        'identity': list(ident), 'metadata_changed_identity': list(identity(contract, metadata, 'store-001')),
        'sequence_changed_identity': list(identity(contract, sequence, 'store-001')),
        'other_storage_event_id': identity(contract, payload, 'store-002')[1],
        'recomputed_identity': list(ident) if stored.get(identity(contract, payload, 'store-001'), (None, None))[1] == 'original-first-receipt' else None,
        'digest': stored[ident][0], 'metadata_changed_digest': digest(metadata)}


def contract_integrity(contract, existing, cases):
    """Refuse a contract that is admitted, has an open schema or lacks paired shape fixtures."""
    from pm_executor_event_semantics import refuse
    schema = json.loads((ROOT / contract['schema_ref']).read_text())
    from pm_executor_schema_refs import check_document
    check_document(schema)
    refuse('integrity_contract', {
        'admitted': contract['event_type'] in existing,
        'additional_properties': copy.deepcopy(schema.get('additionalProperties')),
        'accept_cases': len([x for x in cases if x['expected'] == 'accept']),
        'reject_cases': len([x for x in cases if x['expected'] == 'reject'])}, ' ' + contract['event_type'])


def main(family_name=None):
    from pm_executor_event_semantics import expand_fixture_literals, mutate, fixture_encoding, refuse
    contracts = json.loads((ROOT / 'Plans/executor_event_contracts.json').read_text())['families']
    registry = json.loads((ROOT / 'Plans/event_family_registry.json').read_text())
    existing = {f['event_type'] for f in registry['families']}
    refuse('integrity_contract_set', {'family_count': len(contracts), 'distinct_count': len({c['event_type'] for c in contracts})})
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
        cases = [x for x in fixtures if x['event_type'] == c['event_type']]
        contract_integrity(c, existing, cases)
        for case in cases:
            if 'seed' in case:
                seed = case['seed']
                validate(c, seed['payload'], seed['context'])
                rebuilt = mutate(seed, case['defect_changes'])
                refuse('integrity_seed', {'kind': 'shape', 'rebuilt': fixture_encoding([rebuilt['payload'], rebuilt['context']]),
                                          'specimen': fixture_encoding([case['payload'], case['context']])}, ' ' + case['case'])
            try:
                validate(c, case['payload'], case['context'])
                result = 'accept'
            except (ValueError, jsonschema.ValidationError):
                result = 'reject'
            if result != case['expected']:
                failures.append((c['event_type'], case['case'], result))
        facts = identity_replay_facts(c, copy.deepcopy(cases[0]['payload']))
        refuse('identity_replay', {k: facts[k] for k in ('identity', 'sequence_changed_identity')})
        refuse('identity_replay_fixed', {k: facts[k] for k in ('identity', 'metadata_changed_identity', 'other_storage_event_id',
                                                               'recomputed_identity', 'digest', 'metadata_changed_digest')})
    print(json.dumps({'status': 'fail' if failures else 'pass', 'families': len(contracts), 'fixture_cases': len(fixtures), 'identity_replay_cases': len(contracts)*5, 'schema_reference_cases': ref_cases, 'failures': failures, 'native_execution': 'NOT_RUN'}, indent=2))
    return bool(failures)

if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--family', help='Check one family in a memory-bounded process; default checks all.')
    raise SystemExit(main(parser.parse_args().family))
