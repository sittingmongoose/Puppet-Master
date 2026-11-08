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
    return dict(event_type=name, schema='Plans/event_payloads/planning_wizard/wizard_' + suffix + '.schema.json', source_family='wizard_' + suffix + '_evidence', source_schema='Plans/dcw/wizard_' + suffix + '_evidence.schema.json')

def identity(p):
    h = m.compact_digest([p[k] for k in ('event_type', 'project_id', 'planning_run_id', 'blockage_id', 'observation_id')])
    return ('evt_' + p['event_type'].replace('.', '_') + '_' + h, p['event_type'] + ':' + h)

def envelope(event, authority, compatibility=False, historical=False):
    m.check_schema('Plans/event_record.schema.json', event)
    if not m.HISTORICAL.get():
        m.admit_storage_sequence(event['sequence_id'])
    row = row_for(event['event_type'])
    p = m.event_body(row, event, authority)
    m.guard_rows.enforce('B001', {'site': 'B001', 'code': 'family', 'v0': event['event_type'], 'v1': p['event_type']})
    m.guard_rows.enforce('B002', {'site': 'B002', 'code': 'dispatch', 'v0': event['payload_schema_id'], 'v1': p['schema_id']})
    m.guard_rows.enforce('B003', {'site': 'B003', 'code': 'identity', 'v0': event['event_id'], 'v1': event['idempotency_key'], 'v2': identity(p)})
    m.guard_rows.enforce('B004', {'site': 'B004', 'code': 'scope', 'v0': event['scope_kind']})
    for field in ('project_id', 'thread_id'):
        m.guard_rows.enforce('B005', {'site': 'B005', 'code': 'scope_' + field, 'v0': event[field], 'v1': p[field]})
    m.guard_rows.enforce('B006', {'site': 'B006', 'code': 'wizard_run_alias', 'v0': p['wizard_id'], 'v1': p['planning_run_id']})
    for field in ('run_id', 'node_id', 'attempt_id', 'requested_account_ref', 'effective_account_ref', 'producer_sequence_id'):
        m.guard_rows.enforce('B007', {'site': 'B007', 'code': 'runtime_' + field, 'v0': event[field]})
    for field in ('causation_event_id', 'parent_event_id'):
        m.guard_rows.enforce('B008', {'site': 'B008', 'code': 'causation_' + field, 'v0': event[field], 'v1': p['predecessor_event_id']})
    m.guard_rows.enforce('B009', {'site': 'B009', 'code': 'correlation', 'v0': event['correlation_id'], 'v1': p['blockage_id']})
    m.guard_rows.enforce('B010', {'site': 'B010', 'code': 'original_time', 'v0': event['occurred_at_utc'], 'v1': p['ts']})
    m.guard_rows.enforce('B011', {'site': 'B011', 'code': 'redaction', 'v0': event['redaction_profile']})
    if compatibility:
        m.guard_rows.enforce('B012', {'site': 'B012', 'code': 'compatibility_policy', 'v0': event['replay_policy']})
    elif historical:
        m.guard_rows.enforce('B013', {'site': 'B013', 'code': 'historical_policy', 'v0': event['replay_policy']})
    else:
        m.writer_policy(event['replay_policy'])
    for field, value in event['migration'].items():
        m.guard_rows.enforce('B014', {'site': 'B014', 'code': 'native_migration_' + field, 'v0': value})
    m.secret_free(event)
    return p

def strings(value):
    """Identifier/ref whitespace must not have multiple readings. No time grammar."""
    if type(value) is str:
        m.guard_rows.enforce('B015', {'site': 'B015', 'code': 'identifier_whitespace', 'v0': value, 'v1': value.strip()})
        for c in value:
            m.guard_rows.enforce('B016', {'site': 'B016', 'code': 'identifier_whitespace', 'v0': c})
    elif type(value) is dict:
        for k, v in value.items():
            strings(k)
            strings(v)
    elif type(value) is list:
        for v in value:
            strings(v)

def historical_original(event_id, scenario, seen):
    with m.original_scope():
        a = scenario['authority']
        m.guard_rows.enforce('B017', {'site': 'B017', 'code': 'source_cycle', 'v0': event_id, 'v1': sorted(seen)})
        original = a['events'].get(event_id)
        m.guard_rows.enforce('B018', {'site': 'B018', 'code': 'blocked_original', 'v0': original})
        m.guard_rows.enforce('B019', {'site': 'B019', 'code': 'blocked_original', 'v0': original['event_type']})
        source = a['sources'].get(event_id)
        m.guard_rows.enforce('B020', {'site': 'B020', 'code': 'blocked_source_missing', 'v0': source})
        value = dict(scenario, event=original, source=source, source_key=source_key(original['payload'] if original['payload_ref'] is None else m.event_body(row_for(original['event_type']), original, a)))
        value.pop('stored_source', None)
        if event_id in a.get('stored_sources', {}):
            value['stored_source'] = a['stored_sources'][event_id]
        p = envelope(original, a, historical=True)
        source_contract(value, p, seen | {event_id})
        m.original_receipt(original, source, a)
        return (original, source, p)

def source_key(p):
    return [row_for(p['event_type'])['source_family'] + '.v1'] + [p[k] for k in ('project_id', 'planning_run_id', 'blockage_id', 'observation_id')]

def source_contract(s, p, seen):
    a, source, event = (s['authority'], s['source'], s['event'])
    row = row_for(event['event_type'])
    m.source_storage(row, s)
    m.check_schema(row['source_schema'], source, 'inline')
    m.secret_free(source)
    strings({k: v for k, v in p.items() if k != 'ts'})
    obs = source['observation']
    strings({k: v for k, v in obs.items() if k != 'ts'})
    m.guard_rows.enforce('B021', {'site': 'B021', 'code': 'source_key', 'v0': s['source_key'], 'v1': source_key(p)})
    m.guard_rows.enforce('B022', {'site': 'B022', 'code': 'source_ref', 'v0': source['source_ref'], 'v1': p['source_ref']})
    m.guard_rows.enforce('B023', {'site': 'B023', 'code': 'source_ref', 'v0': p['source_ref'], 'v1': row['source_family'], 'v2': identity(p)[1].split(':')[-1]})
    m.guard_rows.enforce('B024', {'site': 'B024', 'code': 'original_observation', 'v0': m.typed_observation(obs), 'v1': m.typed_observation(a['observations'].get(p['source_ref']))})
    m.guard_rows.enforce('B025', {'site': 'B025', 'code': 'prepared_original', 'v0': m.typed_observation(source['prepared_event']), 'v1': m.typed_observation(event)})
    for field in ('project_id', 'planning_run_id', 'blockage_id', 'observation_id', 'permission_snapshot_id', 'ts'):
        m.guard_rows.enforce('B026', {'site': 'B026', 'code': 'observation_' + field, 'v0': m.typed_observation(obs[field]), 'v1': m.typed_observation(p[field])})
    m.guard_rows.enforce('B027', {'site': 'B027', 'code': 'source_actor', 'v0': event['actor_ref'], 'v1': obs['actor_ref']})
    m.guard_rows.enforce('B028', {'site': 'B028', 'code': 'source_storage_instance', 'v0': source['storage_instance_id'], 'v1': a['storage_instance_id']})
    m.guard_rows.enforce('B029', {'site': 'B029', 'code': 'read_permission', 'v0': type(a['readable_projects']).__name__})
    m.guard_rows.enforce('B030', {'site': 'B030', 'code': 'read_permission', 'v0': p['project_id'], 'v1': a['readable_projects']})
    m.guard_rows.enforce('B031', {'site': 'B031', 'code': 'source_deleted', 'v0': type(a['available_refs']).__name__})
    m.guard_rows.enforce('B032', {'site': 'B032', 'code': 'source_deleted', 'v0': p['source_ref'], 'v1': a['available_refs']})
    m.guard_rows.enforce('B033', {'site': 'B033', 'code': 'permission_snapshot', 'v0': type(a['permission_snapshots']).__name__})
    m.guard_rows.enforce('B034', {'site': 'B034', 'code': 'permission_snapshot', 'v0': p['permission_snapshot_id'], 'v1': a['permission_snapshots']})
    required, cleared = (set(obs['required_conditions']), set(obs['cleared_conditions']))
    if event['event_type'] == 'wizard.blocked':
        m.guard_rows.enforce('B035', {'site': 'B035', 'code': 'foreign_cleared_condition', 'v0': sorted(cleared), 'v1': sorted(required)})
    for step in obs['next_steps']:
        m.guard_rows.enforce('B036', {'site': 'B036', 'code': 'foreign_step_condition', 'v0': step['prevented_by'], 'v1': sorted(required)})
    m.guard_rows.enforce('B037', {'site': 'B037', 'code': 'duplicate_step', 'v0': obs['next_steps']})
    repairs = obs['completed_repair_attempt_refs']
    for ref in repairs:
        actual = a['repair_attempts'].get(ref)
        m.guard_rows.enforce('B038', {'site': 'B038', 'code': 'repair_original_missing', 'v0': actual})
        for field in ('project_id', 'planning_run_id', 'blockage_id'):
            m.guard_rows.enforce('B039', {'site': 'B039', 'code': 'repair_' + field, 'v0': actual[field], 'v1': p[field]})
        m.guard_rows.enforce('B040', {'site': 'B040', 'code': 'repair_not_completed', 'v0': actual['status']})
    previous = None
    if p['predecessor_event_id'] is not None:
        previous, prior_source, prior = historical_original(p['predecessor_event_id'], s, seen)
        for field in ('project_id', 'planning_run_id', 'blockage_id'):
            m.guard_rows.enforce('B041', {'site': 'B041', 'code': 'predecessor_' + field, 'v0': prior[field], 'v1': p[field]})
        m.guard_rows.enforce('B042', {'site': 'B042', 'code': 'episode_required_conditions', 'v0': prior_source['observation']['required_conditions'], 'v1': sorted(required)})
        prior_repairs = prior_source['observation']['completed_repair_attempt_refs']
        m.guard_rows.enforce('B043', {'site': 'B043', 'code': 'repair_history', 'v0': repairs[:len(prior_repairs)], 'v1': prior_repairs})
    if event['event_type'] == 'wizard.blocked':
        for field in ('report_ref', 'resume_url', 'route_target_ref'):
            m.guard_rows.enforce('B044', {'site': 'B044', 'code': 'report_' + field, 'v0': obs[field], 'v1': p[field]})
            m.guard_rows.enforce('B045', {'site': 'B045', 'code': 'unavailable_' + field, 'v0': p[field], 'v1': a['available_refs']})
        route = a['routes'].get(p['route_target_ref'])
        m.guard_rows.enforce('B046', {'site': 'B046', 'code': 'route_missing', 'v0': route})
        for field in ('project_id', 'planning_run_id'):
            m.guard_rows.enforce('B047', {'site': 'B047', 'code': 'route_' + field, 'v0': route[field], 'v1': p[field]})
        m.guard_rows.enforce('B048', {'site': 'B048', 'code': 'route_transport', 'v0': route['resume_url'], 'v1': p['resume_url']})
        m.guard_rows.enforce('B049', {'site': 'B049', 'code': 'no_next_step', 'v0': obs['next_steps']})
        for step in obs['next_steps']:
            m.guard_rows.enforce('B050', {'site': 'B050', 'code': 'run_can_continue', 'v0': step['prevented_by'], 'v1': sorted(required), 'v2': sorted(cleared)})
        m.guard_rows.enforce('B051', {'site': 'B051', 'code': 'completed_repair_count', 'v0': m.typed_observation(p['round_count']), 'v1': m.typed_observation(len(repairs))})
        if obs['kind'] == 'repair_attempt_completed':
            m.guard_rows.enforce('B052', {'site': 'B052', 'code': 'repair_attempt_required', 'v0': repairs})
            if previous:
                m.guard_rows.enforce('B053', {'site': 'B053', 'code': 'repair_not_new', 'v0': repairs, 'v1': prior_repairs})
    else:
        m.guard_rows.enforce('B054', {'site': 'B054', 'code': 'predecessor_required', 'v0': previous})
        m.guard_rows.enforce('B055', {'site': 'B055', 'code': 'conditions_remain', 'v0': sorted(cleared), 'v1': sorted(required)})
        root, _, root_p = historical_original(p['blocked_event_id'], s, seen)
        cursor = prior
        while cursor['predecessor_event_id'] is not None:
            _, _, cursor = historical_original(cursor['predecessor_event_id'], s, seen)
        m.guard_rows.enforce('B056', {'site': 'B056', 'code': 'foreign_original_blockage', 'v0': identity(cursor)[0], 'v1': root['event_id']})
        m.guard_rows.enforce('B057', {'site': 'B057', 'code': 'resolution_source', 'v0': p['resolution_source'], 'v1': obs['resolution_source']})
        action = a['actions'].get(p['resolution_source'])
        m.guard_rows.enforce('B058', {'site': 'B058', 'code': 'clearing_action_missing', 'v0': action})
        for field in ('project_id', 'planning_run_id', 'blockage_id'):
            m.guard_rows.enforce('B059', {'site': 'B059', 'code': 'clearing_action_' + field, 'v0': action[field], 'v1': p[field]})
        m.guard_rows.enforce('B060', {'site': 'B060', 'code': 'clearing_action_unauthorized', 'v0': action['authorized']})
        m.guard_rows.enforce('B061', {'site': 'B061', 'code': 'not_clearing_action', 'v0': action['effect']})
        for field in ('remaining_before', 'cleared_conditions'):
            m.guard_rows.enforce('B062', {'site': 'B062', 'code': 'clearing_action_type_' + field, 'v0': type(action[field]).__name__})
            for v in action[field]:
                m.guard_rows.enforce('B063', {'site': 'B063', 'code': 'clearing_action_type_' + field, 'v0': type(v).__name__})
            m.guard_rows.enforce('B064', {'site': 'B064', 'code': 'clearing_action_duplicates_' + field, 'v0': action[field]})
        m.guard_rows.enforce('B065', {'site': 'B065', 'code': 'clearing_action_before', 'v0': action['remaining_before']})
        m.guard_rows.enforce('B066', {'site': 'B066', 'code': 'clearing_action_before', 'v0': action['remaining_before'], 'v1': sorted(required)})
        m.guard_rows.enforce('B067', {'site': 'B067', 'code': 'clearing_action_incomplete', 'v0': action['cleared_conditions'], 'v1': action['remaining_before']})
        m.guard_rows.enforce('B068', {'site': 'B068', 'code': 'clearing_action_after', 'v0': action['remaining_after']})
    return source

def validate_index_event(event, authority):
    if event['event_type'] in NAMES:
        envelope(event, authority, historical=True)
    else:
        prepared = {r['event_type']: r for r in m.load('Plans/dcw_event_contract_fixtures.json')['families']}
        if event['event_type'] in prepared:
            m.envelope(prepared[event['event_type']], event, compatibility=event['replay_policy'] == 'projector_replay_only', authority=authority)
        else:
            from pm_dcw_registered_schemas import validate_registered
            registry = {r['event_type']: r for r in m.load('Plans/event_family_registry.json')['families']}
            validate_registered(registry.get(event['event_type']), event)

@m.historical_boundary
def verify(s, operation):
    event, a, control = (s['event'], s['authority'], s['control'])
    historical = operation in ('read', 'rebuild', 'compatibility_read')
    m.guard_rows.enforce('B069', {'site': 'B069', 'code': 'family', 'v0': event['event_type'], 'v1': NAMES})
    p = envelope(event, a, compatibility=operation == 'compatibility_read', historical=historical)
    m.guard_rows.enforce('B070', {'site': 'B070', 'code': 'family_not_admitted', 'v0': type(control['admitted_families']).__name__})
    m.guard_rows.enforce('B071', {'site': 'B071', 'code': 'family_not_admitted', 'v0': event['event_type'], 'v1': control['admitted_families']})
    m.guard_rows.enforce('B072', {'site': 'B072', 'code': 'storage_instance', 'v0': control['selected_storage_instance_id'], 'v1': a['storage_instance_id']})
    m.guard_rows.enforce('B073', {'site': 'B073', 'code': 'recovery_epoch', 'v0': m.typed_observation(control['selected_recovery_epoch']), 'v1': m.typed_observation(a['recovery_epoch'])})
    if historical:
        m.guard_rows.enforce('B074', {'site': 'B074', 'code': 'reader_withdrawn', 'v0': control['reader_withdrawn']})
        m.guard_rows.enforce('B075', {'site': 'B075', 'code': 'unsupported_reader', 'v0': control['reader_schema_version'], 'v1': p['schema_version']})
        if operation == 'rebuild':
            m.guard_rows.enforce('B076', {'site': 'B076', 'code': 'replacement_reader', 'v0': control['replacement_reader_admitted']})
            m.guard_rows.enforce('B077', {'site': 'B077', 'code': 'rebuild_incomplete', 'v0': control['rebuild_complete']})
    else:
        m.guard_rows.enforce('B078', {'site': 'B078', 'code': 'writer_cutoff', 'v0': control['writer_cutoff'], 'v1': operation, 'v2': control['pending_disposition']})
        if operation != 'retry':
            m.guard_rows.enforce('B079', {'site': 'B079', 'code': 'effect_unknown', 'v0': control['effect_state']})
            m.guard_rows.enforce('B080', {'site': 'B080', 'code': 'source_CAS', 'v0': m.typed_observation(control['expected_value_revision']), 'v1': m.typed_observation(s['source']['value_revision'])})
            m.guard_rows.enforce('B081', {'site': 'B081', 'code': 'predecessor_CAS', 'v0': control['latest_predecessor_event_id'], 'v1': p['predecessor_event_id']})
            m.guard_rows.enforce('B082', {'site': 'B082', 'code': 'episode_already_cleared', 'v0': control['episode_open']})
        m.guard_rows.enforce('B083', {'site': 'B083', 'code': 'write_permission', 'v0': type(a['writable_projects']).__name__})
        m.guard_rows.enforce('B084', {'site': 'B084', 'code': 'write_permission', 'v0': p['project_id'], 'v1': a['writable_projects']})
    if operation == 'compatibility_read':
        original = a['events'].get(event['event_id'])
        m.guard_rows.enforce('B085', {'site': 'B085', 'code': 'original_custody_missing', 'v0': original})
        m.guard_rows.enforce('B086', {'site': 'B086', 'code': 'original_full_value', 'v0': m.typed_observation(dict(event, replay_policy=original['replay_policy'])), 'v1': m.typed_observation(original)})
        s = copy.deepcopy(s)
        s['event'] = original
        event = original
    source_contract(s, p, {event['event_id']})
    if operation != 'append':
        m.original_receipt(event, s['source'], a)
    if operation == 'retry' and 'retry_request' in s:
        m.writer_policy(s['retry_request']['replay_policy'])
        m.admit_retry_request(row_for(event['event_type']), s['retry_request'])
        m.guard_rows.enforce('B087', {'site': 'B087', 'code': 'idempotency_conflict', 'v0': m.semantic_digest(s['retry_request']), 'v1': m.semantic_digest(event)})
    dependencies = dict(a['sources'])
    dependencies[event['event_id']] = s['source']
    m.guard_rows.enforce('B088', {'site': 'B088', 'code': 'restore_boundary', 'v0': control['restored_boundary_sha256'], 'v1': a['restored_boundary_sha256']})
    for event_id, source in dependencies.items():
        if source['recovery_epoch'] != a['recovery_epoch']:
            admission = a.get('restore_admission')
            m.guard_rows.enforce('B089', {'site': 'B089', 'code': 'restore_admission_missing', 'v0': admission})
            m.check_schema('Plans/event_append_receipt_contracts.schema.json', admission, 'restore_admission')
            m.guard_rows.enforce('B090', {'site': 'B090', 'code': 'restore_instance', 'v0': admission['storage_instance_id'], 'v1': a['storage_instance_id']})
            m.guard_rows.enforce('B091', {'site': 'B091', 'code': 'restore_epoch', 'v0': m.typed_observation(admission['recovery_epoch']), 'v1': m.typed_observation(a['recovery_epoch'])})
            m.guard_rows.enforce('B092', {'site': 'B092', 'code': 'restore_boundary', 'v0': admission['restored_boundary_sha256'], 'v1': a['restored_boundary_sha256']})
            m.guard_rows.enforce('B093', {'site': 'B093', 'code': 'restore_older_only', 'v0': source['recovery_epoch'], 'v1': a['recovery_epoch']})
            physical = s.get('stored_source', source) if event_id == event['event_id'] else a.get('stored_sources', {}).get(event_id, source)
            source_sha = hashlib.sha256(m.canonical_msgpack(physical)).hexdigest()
            m.guard_rows.enforce('B094', {'site': 'B094', 'code': 'restore_source_inventory', 'v0': a['restored_sources'].get(event_id), 'v1': source_sha})
            custody = a['custody'].get(event_id)
            matching = [member for member in admission['members'] if member['event_id'] == event_id]
            m.guard_rows.enforce('B095', {'site': 'B095', 'code': 'restore_member', 'v0': custody})
            m.guard_rows.enforce('B096', {'site': 'B096', 'code': 'restore_member', 'v0': matching})
            for member in matching:
                for k in ('event_id', 'scope_partition', 'event_type', 'idempotency_key', 'producer_semantic_digest'):
                    m.guard_rows.enforce('B097', {'site': 'B097', 'code': 'restore_member', 'v0': m.typed_observation(member[k]), 'v1': m.typed_observation(custody[k])})
            member = matching[0]
            m.guard_rows.enforce('B098', {'site': 'B098', 'code': 'restore_owner', 'v0': member['owner_id'], 'v1': source['prepared_event']['event_type'].replace('.', '_')})
            m.guard_rows.enforce('B099', {'site': 'B099', 'code': 'restore_owner_operation', 'v0': member['owner_operation_id'], 'v1': source['source_ref']})
            m.guard_rows.enforce('B100', {'site': 'B100', 'code': 'restore_owner_sha', 'v0': member['owner_operation_sha256'], 'v1': source_sha})
            for field, inventory in [('source_payload_ref', 'restored_payloads')]:
                if field in physical:
                    ref = physical[field]
                    m.guard_rows.enforce('B101', {'site': 'B101', 'code': 'restore_payload_inventory', 'v0': m.typed_observation(a.get(inventory, {}).get(ref['blake3'])), 'v1': m.typed_observation(ref)})
            original = a['events'].get(event_id, event)
            if original['payload_ref'] is not None:
                ref = m.event_reference(row_for(original['event_type']), original)
                m.guard_rows.enforce('B102', {'site': 'B102', 'code': 'restore_event_payload_inventory', 'v0': m.typed_observation(a.get('restored_event_payloads', {}).get(ref['blake3'])), 'v1': m.typed_observation(ref)})
    if historical:
        m.guard_rows.enforce('B103', {'site': 'B103', 'code': 'checkpoint_storage_instance', 'v0': s['reader']['live_token']['storage_instance_id'], 'v1': a['storage_instance_id']})
        m.index_read(s['index'], s['reader'], a, event_validator=validate_index_event)
        m.index_event(s['index'], event, a)
    m.guard_rows.enforce('B104', {'site': 'B104', 'code': 'reader_effect_forbidden' if historical else 'effect_not_authorized', 'v0': control['requested_effects']})
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
    row = next((r for r in fixtures['families'] if r['event_type'] == family))
    source = next((f for f in m.load('Plans/storage_value_registry.json')['families'] if f['family_id'] == row['source_family']))
    m.guard_rows.enforce('B105', {'site': 'B105', 'code': 'materialized_source', 'v0': source['value_schema_ref'], 'v1': row['source_schema']})
    m.guard_rows.enforce('B106', {'site': 'B106', 'code': 'materialized_source', 'v0': source['value_schema'], 'v1': m.load(row['source_schema'])})
    m.guard_rows.enforce('B107', {'site': 'B107', 'code': 'backup_contract', 'v0': source['recovery_disposition']['backup_required']})
    m.guard_rows.enforce('B108', {'site': 'B108', 'code': 'backup_contract', 'v0': source['restore_disposition']['mutation_fence_on_unresolved']})
    counts = dict(positive=0, negative=0, repair_controls=0)
    results = []
    for case in cases(row):
        actual = outcome(copy.deepcopy(case['value']), case['operation'])
        assert actual == case['expected'], (family, case['id'], case['expected'], actual)
        counts['positive' if actual == 'accept' else 'negative'] += 1
        if actual != 'accept':
            assert outcome(copy.deepcopy(case['repair']), case['operation']) == 'accept', (family, case['id'], 'repair')
            counts['repair_controls'] += 1
        results.append(dict(case_id=case['id'], operation=case['operation'], outcome=actual))
    print(json.dumps(dict(status='PASS', family=family, counts=counts, results=results, membership='ABSENT', retention='PARTIAL', guard_isolation='B3_SWEEP', timestamp='B2_SWEEP', number_domain='SW_N1', native='NOT_RUN'), indent=2))
if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--family', choices=NAMES, required=True)
    main(parser.parse_args().family)
