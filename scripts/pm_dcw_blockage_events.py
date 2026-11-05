#!/usr/bin/env python3
"""DL-431/DL-432 static composition oracles. No admission or native execution.

Authority maps are independently authenticated owner/Storage adapter observations
in the contract. Fixture builders only simulate those observations.
"""
import argparse
import copy
import hashlib
import json

import pm_dcw_event_oracles as m

ROOT = m.ROOT
FIXTURES = 'Plans/dcw_blockage_event_fixtures.json'
NAMES = ('wizard.blocked', 'wizard.unblocked')


def row_for(name):
    suffix = name.split('.')[-1]
    return dict(event_type=name,
                schema='Plans/event_payloads/planning_wizard/wizard_' + suffix + '.schema.json',
                source_family='wizard_' + suffix + '_evidence',
                source_schema='Plans/dcw/wizard_' + suffix + '_evidence.schema.json')


def identity(p):
    # All inputs are strings; use the existing codec, no local number recipe.
    h = m.compact_digest([p[k] for k in ('event_type', 'project_id', 'planning_run_id',
                                        'blockage_id', 'observation_id')])
    return 'evt_' + p['event_type'].replace('.', '_') + '_' + h, p['event_type'] + ':' + h


def envelope(event, authority, compatibility=False, historical=False):
    m.check_schema('Plans/event_record.schema.json', event)
    row = row_for(event['event_type'])
    p = m.event_body(row, event, authority)
    m.require(event['event_type'] == p['event_type'], 'family')
    m.require(event['payload_schema_id'] == p['schema_id'], 'dispatch')
    m.require((event['event_id'], event['idempotency_key']) == identity(p), 'identity')
    m.require(event['scope_kind'] == 'project', 'scope')
    for field in ('project_id', 'thread_id'):
        m.require(event[field] == p[field], 'scope_' + field)
    m.require(p['wizard_id'] == p['planning_run_id'], 'wizard_run_alias')
    for field in ('run_id', 'node_id', 'attempt_id', 'requested_account_ref', 'effective_account_ref',
                  'producer_sequence_id'):
        m.require(event[field] is None, 'runtime_' + field)
    for field in ('causation_event_id', 'parent_event_id'):
        m.require(event[field] == p['predecessor_event_id'], 'causation_' + field)
    m.require(event['correlation_id'] == p['blockage_id'], 'correlation')
    m.require(event['occurred_at_utc'] == p['ts'], 'original_time')
    m.require(event['redaction_profile'] == 'secret_refs_only', 'redaction')
    if compatibility:
        m.require(event['replay_policy'] == 'projector_replay_only', 'compatibility_policy')
    elif historical:
        m.require(event['replay_policy'] in ('projector_replay_only', 'dedupe_by_idempotency_key'), 'historical_policy')
    else:
        m.writer_policy(event['replay_policy'])
    for field, value in event['migration'].items():
        m.require(value is None, 'native_migration_' + field)
    m.secret_free(event)
    return p


def strings(value):
    """Identifier/ref whitespace must not have multiple readings. No time grammar."""
    if type(value) is str:
        m.require(value == value.strip() and all(ord(c) >= 32 for c in value), 'identifier_whitespace')
    elif type(value) is dict:
        for k, v in value.items():
            strings(k)
            strings(v)
    elif type(value) is list:
        for v in value:
            strings(v)


def historical_original(event_id, scenario, seen):
    a = scenario['authority']
    m.require(event_id not in seen, 'source_cycle')
    original = a['events'].get(event_id)
    m.require(original is not None and original['event_type'] == 'wizard.blocked', 'blocked_original')
    source = a['sources'].get(event_id)
    m.require(source is not None, 'blocked_source_missing')
    value = dict(scenario, event=original, source=source,
                 source_key=source_key(original['payload'] if original['payload_ref'] is None else
                                       m.event_body(row_for(original['event_type']), original, a)))
    value.pop('stored_source', None)
    if event_id in a.get('stored_sources', {}):
        value['stored_source'] = a['stored_sources'][event_id]
    p = envelope(original, a, historical=True)
    source_contract(value, p, seen | {event_id})
    m.original_receipt(original, source, a)
    return original, source, p


def source_key(p):
    return [row_for(p['event_type'])['source_family'] + '.v1'] + [p[k] for k in
            ('project_id', 'planning_run_id', 'blockage_id', 'observation_id')]


def source_contract(s, p, seen):
    a, source, event = s['authority'], s['source'], s['event']
    row = row_for(event['event_type'])
    m.source_storage(row, s)
    m.check_schema(row['source_schema'], source, 'inline')
    m.secret_free(source)
    # Timestamp syntax is left to CV-253 and the existing format checker/B2.
    strings({k: v for k, v in p.items() if k != 'ts'})
    obs = source['observation']
    strings({k: v for k, v in obs.items() if k != 'ts'})
    m.require(s['source_key'] == source_key(p), 'source_key')
    m.require(source['source_ref'] == p['source_ref'] == row['source_family'] + ':' + identity(p)[1].split(':')[-1], 'source_ref')
    m.require(m.exact_equal(obs, a['observations'].get(p['source_ref'])), 'original_observation')
    m.require(m.exact_equal(source['prepared_event'], event), 'prepared_original')
    for field in ('project_id', 'planning_run_id', 'blockage_id', 'observation_id', 'permission_snapshot_id', 'ts'):
        m.require(m.exact_equal(obs[field], p[field]), 'observation_' + field)
    m.require(event['actor_ref'] == obs['actor_ref'], 'source_actor')
    m.require(source['storage_instance_id'] == a['storage_instance_id'], 'source_storage_instance')
    m.require(type(a['readable_projects']) is list and p['project_id'] in a['readable_projects'], 'read_permission')
    m.require(type(a['available_refs']) is list and p['source_ref'] in a['available_refs'], 'source_deleted')
    m.require(type(a['permission_snapshots']) is list and p['permission_snapshot_id'] in a['permission_snapshots'], 'permission_snapshot')
    required, cleared = set(obs['required_conditions']), set(obs['cleared_conditions'])
    # Nonempty blocked next steps must each intersect required - cleared.
    # Unblocked observations inherit that authentic nonempty predecessor set.
    # These existing rules imply nonempty required conditions on every path.
    if event['event_type'] == 'wizard.blocked':
        m.require(cleared <= required, 'foreign_cleared_condition')
    for step in obs['next_steps']:
        m.require(set(step['prevented_by']) <= required, 'foreign_step_condition')
    m.require(len({x['step_ref'] for x in obs['next_steps']}) == len(obs['next_steps']), 'duplicate_step')
    repairs = obs['completed_repair_attempt_refs']
    for ref in repairs:
        actual = a['repair_attempts'].get(ref)
        m.require(actual is not None, 'repair_original_missing')
        for field in ('project_id', 'planning_run_id', 'blockage_id'):
            m.require(actual[field] == p[field], 'repair_' + field)
        m.require(actual['status'] == 'completed', 'repair_not_completed')
    previous = None
    if p['predecessor_event_id'] is not None:
        previous, prior_source, prior = historical_original(p['predecessor_event_id'], s, seen)
        for field in ('project_id', 'planning_run_id', 'blockage_id'):
            m.require(prior[field] == p[field], 'predecessor_' + field)
        m.require(set(prior_source['observation']['required_conditions']) <= required, 'episode_required_conditions')
        prior_repairs = prior_source['observation']['completed_repair_attempt_refs']
        m.require(repairs[:len(prior_repairs)] == prior_repairs, 'repair_history')
    if event['event_type'] == 'wizard.blocked':
        for field in ('report_ref', 'resume_url', 'route_target_ref'):
            m.require(obs[field] == p[field], 'report_' + field)
            m.require(p[field] in a['available_refs'], 'unavailable_' + field)
        route = a['routes'].get(p['route_target_ref'])
        m.require(route is not None, 'route_missing')
        for field in ('project_id', 'planning_run_id'):
            m.require(route[field] == p[field], 'route_' + field)
        m.require(route['resume_url'] == p['resume_url'], 'route_transport')
        m.require(bool(obs['next_steps']), 'no_next_step')
        m.require(all(set(step['prevented_by']) & (required - cleared) for step in obs['next_steps']), 'run_can_continue')
        m.require(m.exact_equal(p['round_count'], len(repairs)), 'completed_repair_count')
        if obs['kind'] == 'repair_attempt_completed':
            m.require(bool(repairs), 'repair_attempt_required')
            if previous:
                m.require(len(repairs) > len(prior_repairs), 'repair_not_new')
    else:
        m.require(previous is not None, 'predecessor_required')
        m.require(cleared == required, 'conditions_remain')
        root, _, root_p = historical_original(p['blocked_event_id'], s, seen)
        # The chain's authenticated root equality below also excludes updates.
        # Walk the authenticated chain, rather than trusting a caller root ID.
        cursor = prior
        while cursor['predecessor_event_id'] is not None:
            _, _, cursor = historical_original(cursor['predecessor_event_id'], s, seen)
        m.require(identity(cursor)[0] == root['event_id'], 'foreign_original_blockage')
        m.require(p['resolution_source'] == obs['resolution_source'], 'resolution_source')
        action = a['actions'].get(p['resolution_source'])
        m.require(action is not None, 'clearing_action_missing')
        for field in ('project_id', 'planning_run_id', 'blockage_id'):
            m.require(action[field] == p[field], 'clearing_action_' + field)
        m.require(action['authorized'] is True, 'clearing_action_unauthorized')
        m.require(action['effect'] == 'conditions_cleared', 'not_clearing_action')
        for field in ('remaining_before', 'cleared_conditions'):
            m.require(type(action[field]) is list and all(type(v) is str for v in action[field]),
                      'clearing_action_type_' + field)
            m.require(len(set(action[field])) == len(action[field]), 'clearing_action_duplicates_' + field)
        # Exact equality with [] below already implies the remaining_after type.
        m.require(bool(action['remaining_before']) and set(action['remaining_before']) <= required,
                  'clearing_action_before')
        m.require(set(action['cleared_conditions']) == set(action['remaining_before']), 'clearing_action_incomplete')
        m.require(action['remaining_after'] == [], 'clearing_action_after')
    return source


def validate_index_event(event, authority):
    if event['event_type'] in NAMES:
        envelope(event, authority, historical=True)
    else:
        prepared = {r['event_type']: r for r in m.load('Plans/dcw_event_contract_fixtures.json')['families']}
        if event['event_type'] in prepared:
            m.envelope(prepared[event['event_type']], event,
                       compatibility=event['replay_policy'] == 'projector_replay_only', authority=authority)
        else:
            from pm_dcw_registered_schemas import validate_registered
            registry = {r['event_type']: r for r in m.load('Plans/event_family_registry.json')['families']}
            validate_registered(registry.get(event['event_type']), event)


def verify(s, operation):
    event, a, control = s['event'], s['authority'], s['control']
    historical = operation in ('read', 'rebuild', 'compatibility_read')
    m.require(event['event_type'] in NAMES, 'family')
    p = envelope(event, a, compatibility=operation == 'compatibility_read', historical=historical)
    m.require(type(control['admitted_families']) is list and event['event_type'] in control['admitted_families'], 'family_not_admitted')
    m.require(control['selected_storage_instance_id'] == a['storage_instance_id'], 'storage_instance')
    m.require(m.exact_equal(control['selected_recovery_epoch'], a['recovery_epoch']), 'recovery_epoch')
    if historical:
        m.require(control['reader_withdrawn'] is False, 'reader_withdrawn')
        m.require(control['reader_schema_version'] == p['schema_version'], 'unsupported_reader')
        if operation == 'rebuild':
            m.require(control['replacement_reader_admitted'] is True, 'replacement_reader')
            m.require(control['rebuild_complete'] is True, 'rebuild_incomplete')
    else:
        m.require(control['writer_cutoff'] is False or (control['writer_cutoff'] is True and operation != 'append'
                  and control['pending_disposition'] == 'drain_original'), 'writer_cutoff')
        if operation != 'retry':
            m.require(control['effect_state'] == 'known', 'effect_unknown')
            m.require(m.exact_equal(control['expected_value_revision'], s['source']['value_revision']), 'source_CAS')
            m.require(control['latest_predecessor_event_id'] == p['predecessor_event_id'], 'predecessor_CAS')
            m.require(control['episode_open'] is True, 'episode_already_cleared')
        m.require(type(a['writable_projects']) is list and p['project_id'] in a['writable_projects'], 'write_permission')
    if operation == 'compatibility_read':
        original = a['events'].get(event['event_id'])
        m.require(original is not None, 'original_custody_missing')
        m.require(m.exact_equal(dict(event, replay_policy=original['replay_policy']), original), 'original_full_value')
        s = copy.deepcopy(s)
        s['event'] = original
        event = original
    source_contract(s, p, {event['event_id']})
    # Receipt custody is independent of retry semantic comparison, on all paths.
    if operation != 'append':
        m.original_receipt(event, s['source'], a)
    if operation == 'retry' and 'retry_request' in s:
        m.writer_policy(s['retry_request']['replay_policy'])
        m.require(m.semantic_digest(s['retry_request']) == m.semantic_digest(event), 'idempotency_conflict')
    dependencies = dict(a['sources'])
    dependencies[event['event_id']] = s['source']
    m.require(control['restored_boundary_sha256'] == a['restored_boundary_sha256'], 'restore_boundary')
    for event_id, source in dependencies.items():
        if source['recovery_epoch'] != a['recovery_epoch']:
            admission = a.get('restore_admission')
            m.require(admission is not None, 'restore_admission_missing')
            m.check_schema('Plans/event_append_receipt_contracts.schema.json', admission, 'restore_admission')
            m.require(admission['storage_instance_id'] == a['storage_instance_id'], 'restore_instance')
            m.require(m.exact_equal(admission['recovery_epoch'], a['recovery_epoch']), 'restore_epoch')
            m.require(admission['restored_boundary_sha256'] == a['restored_boundary_sha256'], 'restore_boundary')
            m.require(source['recovery_epoch'] < a['recovery_epoch'], 'restore_older_only')
            physical = (s.get('stored_source', source) if event_id == event['event_id'] else
                        a.get('stored_sources', {}).get(event_id, source))
            source_sha = hashlib.sha256(m.canonical_msgpack(physical)).hexdigest()
            m.require(a['restored_sources'].get(event_id) == source_sha, 'restore_source_inventory')
            custody = a['custody'].get(event_id)
            matching = [member for member in admission['members'] if member['event_id'] == event_id]
            m.require(custody is not None and len(matching) == 1 and all(all(m.exact_equal(member[k], custody[k]) for k in
                      ('event_id', 'scope_partition', 'event_type', 'idempotency_key', 'producer_semantic_digest'))
                      for member in matching), 'restore_member')
            member = matching[0]
            m.require(member['owner_id'] == 'emitter.' + source['prepared_event']['event_type'].replace('.', '_') + '@1.0.0', 'restore_owner')
            m.require(member['owner_operation_id'] == source['source_ref'], 'restore_owner_operation')
            m.require(member['owner_operation_sha256'] == source_sha, 'restore_owner_sha')
            for field, inventory in [('source_payload_ref', 'restored_payloads')]:
                if field in physical:
                    ref = physical[field]
                    m.require(m.exact_equal(a.get(inventory, {}).get(ref['blake3']), ref), 'restore_payload_inventory')
            original = a['events'].get(event_id, event)
            if original['payload_ref'] is not None:
                ref = m.event_reference(row_for(original['event_type']), original)
                m.require(m.exact_equal(a.get('restored_event_payloads', {}).get(ref['blake3']), ref), 'restore_event_payload_inventory')
    if historical:
        m.require(s['reader']['live_token']['storage_instance_id'] == a['storage_instance_id'], 'checkpoint_storage_instance')
        m.index_read(s['index'], s['reader'], a, event_validator=validate_index_event)
        m.index_event(s['index'], event, a)
    m.require(control['requested_effects'] == [], 'reader_effect_forbidden' if historical else 'effect_not_authorized')
    return 'accept'


def outcome(s, operation):
    try:
        return verify(s, operation)
    except m.Refusal as exc:
        return str(exc)


def main(family):
    from pm_dcw_blockage_fixtures import cases
    for path in m.SCHEMAS:
        schema = m.load(str(path.relative_to(ROOT)))
        m.Draft202012Validator.check_schema(schema)
        m.schema_references(schema)
    fixtures = m.load(FIXTURES)
    row = next(r for r in fixtures['families'] if r['event_type'] == family)
    source = next(f for f in m.load('Plans/storage_value_registry.json')['families'] if f['family_id'] == row['source_family'])
    m.require(source['value_schema_ref'] == row['source_schema'] and source['value_schema'] == m.load(row['source_schema']), 'materialized_source')
    m.require(source['recovery_disposition']['backup_required'] is True and source['restore_disposition']['mutation_fence_on_unresolved'] is True, 'backup_contract')
    counts = dict(positive=0, negative=0, repair_controls=0)
    results = []
    for case in cases(row):
        actual = outcome(copy.deepcopy(case['value']), case['operation'])
        assert actual == case['expected'], (family, case['id'], case['expected'], actual)
        counts['positive' if actual == 'accept' else 'negative'] += 1
        if actual != 'accept':
            # Single-fact repair controls validate the coherent base. They are
            # not credited as shared-tool predicate-removal proof.
            assert outcome(copy.deepcopy(case['repair']), case['operation']) == 'accept', (family, case['id'], 'repair')
            counts['repair_controls'] += 1
        results.append(dict(case_id=case['id'], operation=case['operation'], outcome=actual))
    print(json.dumps(dict(status='PASS', family=family, counts=counts, results=results,
                         membership='ABSENT', retention='PARTIAL', guard_isolation='B3_SWEEP',
                         timestamp='B2_SWEEP', number_domain='SW_N1', native='NOT_RUN'), indent=2))


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--family', choices=NAMES, required=True)
    main(parser.parse_args().family)
