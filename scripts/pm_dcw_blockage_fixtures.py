"""Coherent synthetic inputs for the two DL-431/DL-432 contracts.

Issuance functions run before a negative mutation or explicitly reissue all
observational copies of the one changed fact. They never repair native records.
No lane-local serialization, numeric ceiling or date-time grammar is defined.
"""
import base64
import copy
import hashlib
import json

from blake3 import blake3

import pm_dcw_event_oracles as m
from pm_dcw_blockage_events import identity, row_for, source_key
from pm_dcw_index_fixtures import issue, rehash


def seal(s, update_observations=True):
    a = s['authority']
    slots = [*a['sources'].values(), s['source']]
    # Remove obsolete synthetic bindings and issue exact physical originals.
    a['events'] = {}
    a['custody'] = {}
    a['durable_groups'] = {}
    for slot in slots:
        event = s['event'] if slot is s['source'] else slot['prepared_event']
        slot['prepared_event'] = copy.deepcopy(event)
        if update_observations:
            a['observations'][slot['source_ref']] = copy.deepcopy(slot['observation'])
        receipt = copy.deepcopy(a['receipt_template'])
        receipt.update(event_id=event['event_id'], sequence_id=event['sequence_id'],
                       byte_offset=event['sequence_id'] * 1024, durable_end_offset=(event['sequence_id'] + 1) * 1024,
                       commit_group_id='group:' + str(event['sequence_id']))
        custody = copy.deepcopy(a['custody_template'])
        custody.update(event_id=event['event_id'], event_type=event['event_type'], idempotency_key=event['idempotency_key'],
                       scope_partition=m.index_partition(event), first_append_receipt=receipt,
                       producer_semantic_digest=m.semantic_digest(event), original_event_value_commitment=m.commitment(event))
        slot.update(first_append_receipt=copy.deepcopy(receipt),
                    original_event_value_commitment=copy.deepcopy(custody['original_event_value_commitment']),
                    original_segment_ref=custody['original_segment_ref'], publication='receipted')
        a['custody'][event['event_id']] = custody
        a['events'][event['event_id']] = copy.deepcopy(event)
        a['durable_groups'][receipt['commit_group_id']] = dict(
            **{k: receipt[k] for k in ('segment_generation', 'segment_name', 'durable_end_offset', 'manifest_generation', 'durability_class')},
            group_digest=custody['group_digest'], event_ids=[event['event_id']], sync='full_flush')
    issue(s)


def sync_payload(s):
    event, source = s['event'], s['source']
    p, obs = event['payload'], source['observation']
    for k in obs.keys() & p.keys():
        p[k] = copy.deepcopy(obs[k])
    if event['event_type'] == 'wizard.blocked':
        p['round_count'] = len(obs['completed_repair_attempt_refs'])
    event['occurred_at_utc'] = p['ts']
    seal(s)


def reidentify(s):
    from pm_dcw_event_fixtures import replace
    substitutions = {}
    for slot in [*s['authority']['sources'].values(), s['source']]:
        event = s['event'] if slot is s['source'] else slot['prepared_event']
        p = event['payload']
        eid, key = identity(p)
        substitutions[event['event_id']] = eid
        substitutions[event['idempotency_key']] = key
        substitutions[p['source_ref']] = row_for(p['event_type'])['source_family'] + ':' + key.split(':')[-1]
    rebound = replace(s, substitutions)
    s.clear(); s.update(rebound)
    s['source_key'] = source_key(s['event']['payload'])
    seal(s)


def base(name):
    prior = m.load('Plans/dcw_event_contract_fixtures.json')['families']
    template = copy.deepcopy(next(r['positive'] for r in prior if r['event_type'] == 'wizard.opened'))
    a = template['authority']
    receipt_template = copy.deepcopy(template['source']['first_append_receipt'])
    custody_template = copy.deepcopy(next(iter(a['custody'].values())))
    a = {k: a[k] for k in ('storage_instance_id', 'recovery_epoch', 'restored_boundary_sha256',
                           'readable_projects', 'writable_projects', 'permission_snapshots')}
    a.update(receipt_template=receipt_template, custody_template=custody_template, observations={},
             sources={}, events={}, custody={}, durable_groups={}, available_refs=[], repair_attempts={},
             actions={}, routes={}, stored_sources={})
    s = dict(authority=a, control=copy.deepcopy(template['control']))
    s['control'].update(admitted_families=['wizard.blocked', 'wizard.unblocked'], latest_predecessor_event_id=None,
                        episode_open=True, reader_schema_version='1.0.0', requested_effects=[])
    s['control']['expected_value_revision'] = 1
    event = copy.deepcopy(template['event'])
    p = dict(schema_id='pm.event_payload.wizard.blocked.v1', schema_version='1.0.0', event_type='wizard.blocked',
             project_id='project-a', planning_run_id='planning-run-a', wizard_id='planning-run-a',
             thread_id=None, blockage_id='blockage:a', observation_id='observation:blocked', source_ref='',
             permission_snapshot_id=a['permission_snapshots'][0], predecessor_event_id=None,
             round_count=0, report_ref='report:blocked', resume_url='puppetmaster://planning-run-a',
             route_target_ref='route:planning-run-a', ts='2026-11-05T06:00:00Z')
    event.update(event_type=p['event_type'], thread_id=None, correlation_id=p['blockage_id'],
                 occurred_at_utc=p['ts'], observed_at_utc=p['ts'], persisted_at_utc=p['ts'], payload=p,
                 payload_schema_id=p['schema_id'], sequence_id=10)
    event['event_id'], event['idempotency_key'] = identity(p)
    p['source_ref'] = 'wizard_blocked_evidence:' + event['idempotency_key'].split(':')[-1]
    obs = {k: p[k] for k in ('project_id', 'planning_run_id', 'blockage_id', 'observation_id',
                            'permission_snapshot_id', 'ts', 'report_ref', 'resume_url', 'route_target_ref')}
    obs.update(actor_ref=event['actor_ref'], component='planning_wizard', subject_kind='planning_run',
               kind='blockage_recorded', required_conditions=['condition:a', 'condition:b'], cleared_conditions=[],
               completed_repair_attempt_refs=[], next_steps=[dict(step_ref='step:topic-a', prevented_by=['condition:a']),
                                                           dict(step_ref='step:topic-b', prevented_by=['condition:b'])])
    source = dict(schema_id='pm.storage_value.wizard_blocked_evidence.v1', schema_version='1.0.0',
                  storage_instance_id=a['storage_instance_id'], recovery_epoch=0, value_revision=1,
                  source_ref=p['source_ref'], observation=obs, prepared_event=copy.deepcopy(event))
    a['routes'][p['route_target_ref']] = dict(project_id=p['project_id'], planning_run_id=p['planning_run_id'], resume_url=p['resume_url'])
    a['available_refs'] += [p[k] for k in ('source_ref', 'report_ref', 'resume_url', 'route_target_ref')]
    s.update(event=event, source=source, source_key=source_key(p))
    seal(s)
    if name == 'wizard.unblocked':
        a['sources'][event['event_id']] = copy.deepcopy(source)
        predecessor = event['event_id']
        p = {k: v for k, v in p.items() if k not in ('round_count', 'report_ref', 'resume_url', 'route_target_ref')}
        p.update(event_type=name, schema_id='pm.event_payload.wizard.unblocked.v1', observation_id='observation:unblocked',
                 predecessor_event_id=predecessor, blocked_event_id=predecessor, resolution_source='action:cleared')
        event = copy.deepcopy(event)
        event.update(event_type=name, payload=p, payload_schema_id=p['schema_id'], causation_event_id=predecessor,
                     parent_event_id=predecessor, sequence_id=11)
        event['event_id'], event['idempotency_key'] = identity(p)
        p['source_ref'] = 'wizard_unblocked_evidence:' + event['idempotency_key'].split(':')[-1]
        obs = {k: v for k, v in obs.items() if k not in ('report_ref', 'resume_url', 'route_target_ref')}
        obs.update(observation_id=p['observation_id'], kind='conditions_cleared', cleared_conditions=['condition:a', 'condition:b'],
                   resolution_source=p['resolution_source'], next_steps=[dict(step_ref='step:topic-a', prevented_by=[])])
        source = dict(source, schema_id='pm.storage_value.wizard_unblocked_evidence.v1',
                      source_ref=p['source_ref'], observation=obs, prepared_event=copy.deepcopy(event))
        a['available_refs'].append(p['source_ref'])
        a['actions'][p['resolution_source']] = dict(project_id=p['project_id'], planning_run_id=p['planning_run_id'],
            blockage_id=p['blockage_id'], authorized=True, effect='conditions_cleared', remaining_before=['condition:b'],
            cleared_conditions=['condition:b'], remaining_after=[])
        s.update(event=event, source=source, source_key=source_key(p))
        s['control']['latest_predecessor_event_id'] = predecessor
        seal(s)
    return s


def externalize(s, source=True, event=False):
    """SP-337 metadata only; body bytes and index durability are separate facts."""
    if event:
        body = copy.deepcopy(s['event']['payload'])
        raw = m.canonical_msgpack(body)
        ref = dict(blake3=blake3(raw).hexdigest(), byte_size=len(raw),
                   media_type='application/vnd.puppetmaster.event.wizard-' + s['event']['event_type'].split('.')[-1] + '+msgpack')
        s['event'].update(payload={}, payload_ref=m.canonical_json(ref, sort_keys=True).decode())
        s['authority'].setdefault('event_payloads', {})[ref['blake3']] = dict(
            body=body, bytes_hex=raw.hex(), readable=True, durable=True, index_durable=True)
        seal(s)
    if source:
        from pm_dcw_event_fixtures import source_reference
        source_reference(row_for(s['event']['event_type']), s)


def blocked_update(s):
    """A new recorded repair observation in the same authenticated blockage."""
    if s['event']['event_type'] == 'wizard.blocked':
        root = copy.deepcopy(s['source'])
        s['authority']['sources'][s['event']['event_id']] = root
    else:
        root = copy.deepcopy(s['authority']['sources'][s['event']['payload']['predecessor_event_id']])
    e = copy.deepcopy(root['prepared_event']); p = e['payload']
    p.update(observation_id='observation:repair', predecessor_event_id=e['event_id'], round_count=1)
    e.update(sequence_id=11, causation_event_id=p['predecessor_event_id'], parent_event_id=p['predecessor_event_id'])
    e['event_id'], e['idempotency_key'] = identity(p)
    p['source_ref'] = 'wizard_blocked_evidence:' + e['idempotency_key'].split(':')[-1]
    obs = copy.deepcopy(root['observation'])
    obs.update(observation_id=p['observation_id'], kind='repair_attempt_completed', completed_repair_attempt_refs=['repair:one'])
    source = dict(root, source_ref=p['source_ref'], observation=obs, prepared_event=e)
    s['authority']['available_refs'].append(p['source_ref'])
    s['authority']['repair_attempts']['repair:one'] = dict(project_id=p['project_id'], planning_run_id=p['planning_run_id'],
                                                         blockage_id=p['blockage_id'], status='completed')
    if s['event']['event_type'] == 'wizard.blocked':
        s.update(event=e, source=source, source_key=source_key(p))
    else:
        s['authority']['sources'][e['event_id']] = source
        s['event']['payload']['predecessor_event_id'] = e['event_id']
        s['event'].update(causation_event_id=e['event_id'], parent_event_id=e['event_id'], sequence_id=12)
        s['source']['observation']['completed_repair_attempt_refs'] = ['repair:one']
    s['control']['latest_predecessor_event_id'] = s['event']['payload']['predecessor_event_id']
    seal(s)


def event_boundary(name, target, referenced=True):
    s = base(name)
    field = 'report_ref' if name == 'wizard.blocked' else 'resolution_source'
    old = s['event']['payload'][field]
    for n in range(target - len(m.canonical_msgpack(s['event']['payload'])) - 12,
                   target - len(m.canonical_msgpack(s['event']['payload'])) + 20):
        s['event']['payload'][field] = 'ref:' + 'a' * n
        if len(m.canonical_msgpack(s['event']['payload'])) == target:
            break
    else:
        raise AssertionError('event boundary unreachable')
    new = s['event']['payload'][field]
    s['source']['observation'][field] = new
    if name == 'wizard.blocked':
        s['authority']['available_refs'].append(new)
    else:
        s['authority']['actions'][new] = s['authority']['actions'].pop(old)
    seal(s)
    externalize(s, source=True, event=referenced)
    return s


def restore(s):
    a = s['authority']; a['recovery_epoch'] = 1
    s['control']['selected_recovery_epoch'] = 1
    template = m.load('Plans/dcw_event_contract_fixtures.json')['families'][0]['positive']['authority'].get('restore_admission')
    if template is None:
        # Existing owner's closed schema, not a new restore envelope.
        case = next(c for c in m.load('Plans/dcw_event_contract_fixtures.json')['families'][0]['cases']
                    if c['case_id'] == 'coherent_restore_preserves_original_bytes')
        original = copy.deepcopy(m.load('Plans/dcw_event_contract_fixtures.json')['families'][0]['positive'])
        for mutation in case['mutations']:
            m.patch(original, mutation)
        template = original['authority']['restore_admission']
    admission = copy.deepcopy(template)
    admission.update(storage_instance_id=a['storage_instance_id'], recovery_epoch=1,
                     restored_boundary_sha256=a['restored_boundary_sha256'], members=[])
    a['restored_sources'] = {}
    a['restored_payloads'] = {}
    a['restored_event_payloads'] = {}
    sources = dict(a['sources']); sources[s['event']['event_id']] = s['source']
    for event_id, source in sources.items():
        custody = a['custody'][event_id]
        physical = s.get('stored_source', source) if event_id == s['event']['event_id'] else a.get('stored_sources', {}).get(event_id, source)
        source_sha = hashlib.sha256(m.canonical_msgpack(physical)).hexdigest()
        member = {k: custody[k] for k in ('event_id', 'scope_partition', 'event_type', 'idempotency_key', 'producer_semantic_digest')}
        member.update(owner_id='emitter.' + source['prepared_event']['event_type'].replace('.', '_') + '@1.0.0',
                      owner_operation_id=source['source_ref'], owner_operation_sha256=source_sha)
        admission['members'].append(member)
        a['restored_sources'][event_id] = source_sha
        if 'source_payload_ref' in physical:
            ref = physical['source_payload_ref']; a['restored_payloads'][ref['blake3']] = copy.deepcopy(ref)
        event = a['events'][event_id]
        if event['payload_ref'] is not None:
            ref = json.loads(event['payload_ref']); a['restored_event_payloads'][ref['blake3']] = ref
    a['restore_admission'] = admission
    issue(s)


def cases(row):
    name = row['event_type']; positive = row['positive']
    result = []
    def add(case_id, base_value, operation='publish', mutate=None, expected='accept', coherent=False):
        value = copy.deepcopy(base_value)
        if mutate:
            mutate(value)
        if coherent:
            seal(value)
        result.append(dict(id=case_id, value=value, repair=copy.deepcopy(base_value), operation=operation, expected=expected))
    def edit_obs(fn):
        def edit(s):
            fn(s['source']['observation'])
            sync_payload(s)
        return edit
    def edit_event(field, value):
        return lambda s: s['event'].__setitem__(field, copy.deepcopy(value))
    for operation in ('append', 'publish', 'retry', 'read', 'rebuild'):
        add(operation, positive, operation)
    compatible = copy.deepcopy(positive); compatible['event']['replay_policy'] = 'projector_replay_only'
    add('compatibility_view', compatible, 'compatibility_read')
    retained = copy.deepcopy(positive)
    retained['control'].update(writer_cutoff=True, effect_state='unknown', expected_value_revision=999,
                               latest_predecessor_event_id='newer', episode_open=False)
    retained['authority']['writable_projects'] = []
    for operation in ('read', 'rebuild'):
        add('history_after_live_change_' + operation, retained, operation)
    retry_after_advance = copy.deepcopy(positive)
    retry_after_advance['control'].update(effect_state='unknown', expected_value_revision=999,
                                        latest_predecessor_event_id='newer', episode_open=False)
    add('receipt_only_retry_after_live_advance', retry_after_advance, 'retry')
    add('retry_after_advance_still_needs_original', retry_after_advance, 'retry',
        lambda s: s['authority']['custody'].pop(s['event']['event_id']), 'original_custody_missing')
    historical = copy.deepcopy(positive)
    historical['event']['replay_policy'] = 'projector_replay_only'; seal(historical)
    add('retained_replay_only_original', historical, 'read')
    assigned = copy.deepcopy(positive)
    assigned['retry_request'] = copy.deepcopy(assigned['event'])
    assigned['retry_request'].update(sequence_id=999, observed_at_utc='2026-11-05T06:01:00Z', persisted_at_utc='2026-11-05T06:01:00Z')
    add('retry_storage_metadata_excluded', assigned, 'retry')
    from pm_dcw_registered_cases import mixed
    mixed_source = mixed(dict(positive=positive))
    add('mixed_registered_source', mixed_source, 'read')
    for operation in ('append', 'publish', 'retry'):
        add('replay_only_' + operation, positive, operation, edit_event('replay_policy', 'projector_replay_only'),
            'replay_only_not_appendable', coherent=True)
    for field, value, expected in [
        ('event_id', 'evt_forged', 'identity'), ('idempotency_key', 'forged', 'identity'),
        ('payload_schema_id', 'forged', 'dispatch'), ('scope_kind', 'application', 'scope'),
        ('project_id', 'foreign', 'scope_project_id'), ('thread_id', 'foreign', 'scope_thread_id'),
        ('correlation_id', 'foreign', 'correlation'), ('causation_event_id', 'foreign', 'causation_causation_event_id'),
        ('parent_event_id', 'foreign', 'causation_parent_event_id'), ('actor_ref', 'actor:forged', 'source_actor'),
        ('redaction_profile', 'no_secrets', 'redaction')]:
        # Application envelopes must also satisfy their shared null-Project
        # constraint, so test scope on a fully coherent application value below.
        if field == 'scope_kind':
            continue
        add('envelope_' + field, positive, mutate=edit_event(field, value), expected=expected, coherent=True)
    for field in ('run_id', 'node_id', 'attempt_id', 'requested_account_ref', 'effective_account_ref', 'producer_sequence_id'):
        add('runtime_' + field, positive, mutate=edit_event(field, 1 if field == 'producer_sequence_id' else 'foreign'),
            expected='runtime_' + field, coherent=True)
    for field in ('sequence_id', 'observed_at_utc', 'persisted_at_utc'):
        # Source copy follows the claim; independently authenticated Storage
        # original stays exact. One Storage-original equality defect.
        def forge(s, field=field):
            s['event'][field] = 99 if field == 'sequence_id' else '2026-11-05T06:00:01Z'
            s['source']['prepared_event'] = copy.deepcopy(s['event'])
        add('forged_storage_' + field, positive, mutate=forge, expected='original_full_value')
    controls = [('admitted_families', [], 'family_not_admitted'), ('writer_cutoff', True, 'writer_cutoff'),
                ('effect_state', 'unknown', 'effect_unknown'), ('expected_value_revision', 2, 'source_CAS'),
                ('latest_predecessor_event_id', 'foreign', 'predecessor_CAS'), ('episode_open', False, 'episode_already_cleared'),
                ('requested_effects', ['rerun_planning'], 'effect_not_authorized')]
    for field, value, code in controls:
        add('control_' + field, positive, 'append' if field == 'writer_cutoff' else 'publish',
            mutate=lambda s, f=field, v=value: s['control'].__setitem__(f, v), expected=code)
    for field, value, code in [('reader_withdrawn', True, 'reader_withdrawn'), ('reader_schema_version', '9.0.0', 'unsupported_reader'),
                             ('requested_effects', ['rerun_planning'], 'reader_effect_forbidden')]:
        add('reader_' + field, positive, 'read', lambda s, f=field, v=value: s['control'].__setitem__(f, v), code)
    for field, code in [('replacement_reader_admitted', 'replacement_reader'), ('rebuild_complete', 'rebuild_incomplete')]:
        add(field, positive, 'rebuild', lambda s, f=field: s['control'].__setitem__(f, False), code)
    for field, code in [('readable_projects', 'read_permission'), ('writable_projects', 'write_permission'),
                        ('permission_snapshots', 'permission_snapshot')]:
        add(field, positive, mutate=lambda s, f=field: s['authority'].__setitem__(f, []), expected=code)
    add('source_deleted', positive, mutate=lambda s: s['authority']['available_refs'].remove(s['source']['source_ref']), expected='source_deleted')
    for field in ('project_id', 'planning_run_id', 'blockage_id', 'observation_id', 'permission_snapshot_id', 'ts'):
        def join(s, field=field):
            s['source']['observation'][field] = '2026-11-05T06:00:01Z' if field == 'ts' else 'foreign'
            s['authority']['observations'][s['source']['source_ref']] = copy.deepcopy(s['source']['observation'])
        add('observation_join_' + field, positive, mutate=join, expected='observation_' + field)
    add('original_observation', positive, mutate=lambda s: s['authority']['observations'][s['source']['source_ref']].update(actor_ref='actor:other'), expected='original_observation')
    add('source_key', positive, mutate=lambda s: s['source_key'].__setitem__(4, 'foreign'), expected='source_key')
    add('wizard_alias', positive, mutate=lambda s: s['event']['payload'].update(wizard_id='topic:one'), expected='wizard_run_alias', coherent=True)
    add('required_conditions_empty', positive, mutate=edit_obs(lambda o: o.update(required_conditions=[], cleared_conditions=[], next_steps=[])), expected='required_conditions_empty')
    add('foreign_cleared_condition', positive, mutate=edit_obs(lambda o: o['cleared_conditions'].append('foreign')), expected='foreign_cleared_condition')
    add('foreign_step_condition', positive, mutate=edit_obs(lambda o: o['next_steps'][0]['prevented_by'].append('foreign')), expected='foreign_step_condition')
    add('duplicate_step', positive, mutate=edit_obs(lambda o: o['next_steps'].append(copy.deepcopy(o['next_steps'][0]))), expected='duplicate_step')
    # Every closed payload field has one missing-field witness with all stored copies coherent.
    for field in positive['event']['payload']:
        add('missing_payload_' + field, positive, mutate=lambda s, f=field: s['event']['payload'].pop(f), expected='schema', coherent=True)
    for value in ('false', '0', None, [], {}):
        add('wrong_payload_type_' + repr(value), positive, mutate=edit_event('payload', value), expected='schema', coherent=True)
    add('extra_payload_field', positive, mutate=lambda s: s['event']['payload'].update(extra=True), expected='schema', coherent=True)
    for field in ('project_id', 'planning_run_id', 'blockage_id', 'observation_id', 'permission_snapshot_id'):
        def lf(s, field=field):
            from pm_dcw_event_fixtures import replace
            old = s['event']['payload'][field]
            rebound = replace(s, {old: old + '\n'})
            s.clear(); s.update(rebound)
            reidentify(s)
        add('identifier_lf_' + field, positive, mutate=lf, expected='identifier_whitespace')
    if name == 'wizard.blocked':
        add('one_topic_can_continue', positive, mutate=edit_obs(lambda o: o['next_steps'][1].update(prevented_by=[])), expected='run_can_continue')
        add('already_clear', positive, mutate=edit_obs(lambda o: o.update(cleared_conditions=copy.deepcopy(o['required_conditions']))), expected='run_can_continue')
        add('no_next_step', positive, mutate=edit_obs(lambda o: o.update(next_steps=[])), expected='no_next_step')
        add('count_not_completed', positive, mutate=lambda s: s['event']['payload'].update(round_count=1), expected='completed_repair_count', coherent=True)
        for value in ('0', False, None, [], {}):
            add('wrong_count_type_' + repr(value), positive, mutate=lambda s, v=value: s['event']['payload'].update(round_count=v), expected='schema', coherent=True)
        repaired = copy.deepcopy(positive)
        repaired['source']['observation'].update(kind='repair_attempt_completed', completed_repair_attempt_refs=['repair:one'])
        repaired['authority']['repair_attempts']['repair:one'] = dict(project_id='project-a', planning_run_id='planning-run-a', blockage_id='blockage:a', status='completed')
        sync_payload(repaired)
        add('one_completed_repair_no_threshold', repaired)
        add('repair_not_completed', repaired, mutate=lambda s: s['authority']['repair_attempts']['repair:one'].update(status='running'), expected='repair_not_completed')
        add('repair_original_missing', repaired, mutate=lambda s: s['authority']['repair_attempts'].clear(), expected='repair_original_missing')
        for field in ('project_id', 'planning_run_id', 'blockage_id'):
            add('repair_join_' + field, repaired, mutate=lambda s, f=field: s['authority']['repair_attempts']['repair:one'].__setitem__(f, 'foreign'), expected='repair_' + field)
        add('repair_attempt_required', positive, mutate=edit_obs(lambda o: o.update(kind='repair_attempt_completed')), expected='repair_attempt_required')
        many = copy.deepcopy(repaired)
        for n in range(2, 5):
            ref = 'repair:' + str(n); many['source']['observation']['completed_repair_attempt_refs'].append(ref)
            many['authority']['repair_attempts'][ref] = copy.deepcopy(many['authority']['repair_attempts']['repair:one'])
        sync_payload(many); add('four_completed_repairs_no_trigger', many)
        for field in ('report_ref', 'resume_url', 'route_target_ref'):
            add('unavailable_' + field, positive, mutate=lambda s, f=field: s['authority']['available_refs'].remove(s['event']['payload'][f]), expected='unavailable_' + field)
        for field in ('project_id', 'planning_run_id', 'resume_url'):
            add('route_' + field, positive, mutate=lambda s, f=field: s['authority']['routes'][s['event']['payload']['route_target_ref']].__setitem__(f, 'foreign'), expected='route_transport' if field == 'resume_url' else 'route_' + field)
    else:
        add('one_condition_remains', positive, mutate=edit_obs(lambda o: o.update(cleared_conditions=['condition:a'])), expected='conditions_remain')
        for field, value, code in [('authorized', False, 'clearing_action_unauthorized'), ('effect', 'page_opened', 'not_clearing_action'),
                                  ('remaining_before', [], 'clearing_action_before'), ('cleared_conditions', [], 'clearing_action_incomplete'),
                                  ('remaining_after', ['condition:b'], 'clearing_action_after')]:
            add('action_' + field, positive, mutate=lambda s, f=field, v=value: s['authority']['actions'][s['event']['payload']['resolution_source']].__setitem__(f, v), expected=code)
        for effect in ('other_topic_cleared', 'history_reprocessed', 'report_edited'):
            add(effect, positive, mutate=lambda s, v=effect: s['authority']['actions'][s['event']['payload']['resolution_source']].update(effect=v), expected='not_clearing_action')
        for field in ('project_id', 'planning_run_id', 'blockage_id'):
            add('action_join_' + field, positive, mutate=lambda s, f=field: s['authority']['actions'][s['event']['payload']['resolution_source']].__setitem__(f, 'foreign'), expected='clearing_action_' + field)
        for value in ('false', 'true', 0, 1, None, [], {}):
            add('action_authorization_type_' + repr(value), positive, mutate=lambda s, v=value: s['authority']['actions'][s['event']['payload']['resolution_source']].update(authorized=v), expected='clearing_action_unauthorized')
        add('clearing_action_missing', positive, mutate=lambda s: s['authority']['actions'].clear(), expected='clearing_action_missing')
        for operation in ('append', 'publish', 'retry', 'read', 'rebuild', 'compatibility_read'):
            original = copy.deepcopy(positive)
            if operation == 'compatibility_read': original['event']['replay_policy'] = 'projector_replay_only'
            add('blocked_original_custody_' + operation, original, operation,
                lambda s: s['authority']['custody'].pop(s['event']['payload']['blocked_event_id']), 'original_custody_missing')
    for target in (16384, 16385, 20000):
        large = event_boundary(name, target, referenced=target > 16384)
        add('event_bytes_' + str(target), large, 'read')
        if target > 16384:
            ref = json.loads(large['event']['payload_ref'])
            for field, code in [('readable', 'event_payload_unavailable'), ('durable', 'event_payload_not_durable'), ('index_durable', 'event_payload_not_durable')]:
                add('event_pack_' + str(target) + '_' + field, large, 'read',
                    lambda s, f=field, key=ref['blake3']: s['authority']['event_payloads'][key].__setitem__(f, False), code)
            add('source_pack_missing_' + str(target), large, 'read', lambda s: s['authority']['payloads'].clear(), 'source_payload_missing')
        restored = copy.deepcopy(large); restore(restored)
        add('restore_' + str(target), restored, 'read')
        add('restore_source_missing_' + str(target), restored, 'read', lambda s: s['authority']['restored_sources'].pop(s['event']['event_id']), 'restore_source_inventory')
    # Row/source join uses coherent digest copies: integrity is a distinct predicate.
    def row_join(s):
        g = s['index']['checkpoint']['generations'][s['index']['checkpoint']['current_generation_id']]
        first = next(iter(s['index']['datasets'][g['index_dataset_name']].values()))
        first['payload_sha256'] = 'b' * 64
        rehash(s['index'], s['reader'])
    add('index_row_source_coherent_digests', positive, 'read', row_join, 'index_row_source')
    add('checkpoint_foreign_store', positive, 'read', lambda s: s['reader']['live_token'].update(storage_instance_id='22222222-2222-4222-8222-222222222222'), 'checkpoint_storage_instance')
    add('index_predecessor_CAS', positive, 'read', lambda s: s['reader'].update(expected_predecessor='b' * 64), 'index_CAS')
    add('persisted_snapshot_forbidden', positive, 'read', lambda s: s['reader']['durable_token'].update(redb_snapshot_id='forged'), 'durable_snapshot_forbidden')
    add('original_time', positive, mutate=edit_event('occurred_at_utc', '2026-11-05T06:01:00Z'), expected='original_time', coherent=True)
    add('source_storage_instance', positive, mutate=lambda s: s['source'].update(storage_instance_id='foreign'), expected='source_storage_instance')
    add('source_ref', positive, mutate=lambda s: s['source'].update(source_ref='foreign'), expected='source_ref')
    add('prepared_original', positive, mutate=lambda s: s['source']['prepared_event'].update(actor_ref='actor:other'), expected='prepared_original')
    for field, code in [('selected_storage_instance_id', 'storage_instance'), ('selected_recovery_epoch', 'recovery_epoch'),
                        ('restored_boundary_sha256', 'restore_boundary')]:
        value = 2 if field == 'selected_recovery_epoch' else 'b' * 64
        add('selected_' + field, positive, mutate=lambda s, f=field, v=value: s['control'].__setitem__(f, v), expected=code)
    for operation in ('publish', 'retry', 'read', 'rebuild'):
        add('original_custody_missing_' + operation, positive, operation,
            lambda s: s['authority']['custody'].pop(s['event']['event_id']), 'original_custody_missing')
    add('retry_semantic_conflict', assigned, 'retry', lambda s: s['retry_request'].update(actor_ref='actor:other'), 'idempotency_conflict')
    add('retry_caller_replay_only', assigned, 'retry', lambda s: s['retry_request'].update(replay_policy='projector_replay_only'), 'replay_only_not_appendable')
    def bad_commitment(s):
        c = s['authority']['custody'][s['event']['event_id']]
        c['original_event_value_commitment']['sha256'] = 'b' * 64
        s['source']['original_event_value_commitment'] = copy.deepcopy(c['original_event_value_commitment'])
    add('forged_full_value_commitment', positive, mutate=bad_commitment, expected='original_commitment')
    for field, code in [('admitted_families', 'family_not_admitted'), ('readable_projects', 'read_permission'),
                        ('writable_projects', 'write_permission'), ('permission_snapshots', 'permission_snapshot')]:
        def container(s, field=field):
            parent = s['control'] if field == 'admitted_families' else s['authority']
            parent[field] = parent[field][0]
        add('string_container_' + field, positive, mutate=container, expected=code)
    for field, op, code in [('writer_cutoff', 'append', 'writer_cutoff'), ('episode_open', 'publish', 'episode_already_cleared'),
                             ('reader_withdrawn', 'read', 'reader_withdrawn'), ('replacement_reader_admitted', 'rebuild', 'replacement_reader'),
                             ('rebuild_complete', 'rebuild', 'rebuild_incomplete')]:
        for value in ('false', 'true', 0, 1, None, [], {}):
            add('control_type_' + field + '_' + repr(value), positive, op,
                lambda s, f=field, v=value: s['control'].__setitem__(f, v), code)
    updated = copy.deepcopy(positive); blocked_update(updated)
    add('same_episode_repair_chain', updated, 'read')
    add('same_episode_repair_chain_publish', updated)
    if name == 'wizard.blocked':
        add('route_missing', positive, mutate=lambda s: s['authority']['routes'].clear(), expected='route_missing')
        for field in ('report_ref', 'resume_url', 'route_target_ref'):
            def report_join(s, field=field):
                old = s['source']['observation'][field]
                s['source']['observation'][field] = 'ref:other'
                s['authority']['observations'][s['source']['source_ref']] = copy.deepcopy(s['source']['observation'])
            add('report_join_' + field, positive, mutate=report_join, expected='report_' + field)
        unchanged = copy.deepcopy(updated)
        unchanged['source']['observation']['kind'] = 'blockage_recorded'; seal(unchanged)
        add('repeated_blockage_observation', unchanged)
        # A valid repeated blockage observation with unchanged completed history
        # can only become a repair observation when a new attempt completes.
        same = copy.deepcopy(unchanged)
        predecessor = same['authority']['sources'][same['event']['payload']['predecessor_event_id']]
        predecessor['observation']['completed_repair_attempt_refs'] = ['repair:one']
        predecessor['prepared_event']['payload']['round_count'] = 1
        seal(same)
        add('repair_not_new', same, mutate=edit_obs(lambda o: o.update(kind='repair_attempt_completed')), expected='repair_not_new')
    else:
        add('resolution_source_join', positive, mutate=lambda s: s['event']['payload'].update(resolution_source='action:other'), expected='resolution_source', coherent=True)
        add('blocked_source_missing', positive, mutate=lambda s: s['authority']['sources'].pop(s['event']['payload']['blocked_event_id']), expected='blocked_source_missing')
        add('blocked_original_missing', positive, mutate=lambda s: s['authority']['events'].pop(s['event']['payload']['blocked_event_id']), expected='blocked_original')
        add('root_is_latest_update', updated, mutate=lambda s: s['event']['payload'].update(blocked_event_id=s['event']['payload']['predecessor_event_id']), expected='not_original_blockage', coherent=True)
        for field in ('remaining_before', 'cleared_conditions', 'remaining_after'):
            for value in ('condition:b', None, {}, False):
                add('action_container_' + field + '_' + repr(value), positive,
                    mutate=lambda s, f=field, v=value: s['authority']['actions'][s['event']['payload']['resolution_source']].__setitem__(f, v), expected='clearing_action_type_' + field)
        for field in ('remaining_before', 'cleared_conditions'):
            add('action_duplicate_' + field, positive,
                mutate=lambda s, f=field: s['authority']['actions'][s['event']['payload']['resolution_source']][f].append('condition:b'), expected='clearing_action_duplicates_' + field)
    large = event_boundary(name, 16385)
    restored = copy.deepcopy(large); restore(restored)
    for field, value, code in [('storage_instance_id', 'foreign', 'restore_instance'), ('recovery_epoch', 2, 'restore_epoch'),
                              ('restored_boundary_sha256', 'b' * 64, 'restore_boundary')]:
        add('restore_admission_' + field, restored, 'read',
            lambda s, f=field, v=value: s['authority']['restore_admission'].__setitem__(f, v), code)
    add('restore_admission_missing', restored, 'read', lambda s: s['authority'].pop('restore_admission'), 'restore_admission_missing')
    for field, value, code in [('event_type', 'foreign', 'restore_member'), ('owner_id', 'foreign', 'restore_owner'),
                              ('owner_operation_id', 'foreign', 'restore_owner_operation'), ('owner_operation_sha256', 'b' * 64, 'restore_owner_sha')]:
        add('restore_member_' + field, restored, 'read',
            lambda s, f=field, v=value: next(x for x in s['authority']['restore_admission']['members'] if x['event_id'] == s['event']['event_id']).__setitem__(f, v), code)
    add('restore_source_payload_inventory', restored, 'read', lambda s: s['authority']['restored_payloads'].clear(), 'restore_payload_inventory')
    add('restore_event_payload_inventory', restored, 'read', lambda s: s['authority']['restored_event_payloads'].clear(), 'restore_event_payload_inventory')
    # Corrupt only the addressed digest; move the observational key with it.
    def source_digest(s):
        ref = s['stored_source']['source_payload_ref']; old = ref['blake3']; ref['blake3'] = 'b' * 64
        s['authority']['payloads'][ref['blake3']] = s['authority']['payloads'].pop(old)
    add('source_payload_digest', large, 'read', source_digest, 'source_payload_digest')
    def event_digest(s):
        ref = json.loads(s['event']['payload_ref']); old = ref['blake3']; ref['blake3'] = 'b' * 64
        s['authority']['event_payloads'][ref['blake3']] = s['authority']['event_payloads'].pop(old)
        s['event']['payload_ref'] = m.canonical_json(ref, sort_keys=True).decode()
        seal(s)
        externalize(s, source=True)
    add('event_payload_digest', large, 'read', event_digest, 'event_payload_digest')
    add('oversized_inline_source', large, 'read', lambda s: s.pop('stored_source'), 'refuse_oversized_source')
    def inline_large_event(s):
        ref = json.loads(s['event']['payload_ref'])
        s['event']['payload'] = copy.deepcopy(s['authority']['event_payloads'][ref['blake3']]['body'])
        s['event']['payload_ref'] = None
        seal(s)
        externalize(s, source=True)
    add('oversized_inline_event', large, 'read', inline_large_event, 'inline_limit')
    add('incidental_thread_retry_conflict', assigned, 'retry', lambda s: s['retry_request'].update(thread_id='thread:other'), 'idempotency_conflict')
    add('compatibility_policy', compatible, 'compatibility_read', edit_event('replay_policy', 'dedupe_by_idempotency_key'), 'compatibility_policy')
    add('unsupported_original_policy', positive, 'read', edit_event('replay_policy', 'append_once'), 'historical_policy', coherent=True)
    add('forged_compatibility_metadata', compatible, 'compatibility_read', edit_event('observed_at_utc', '2026-11-05T06:01:00Z'), 'original_full_value')
    for field in positive['event']['migration']:
        add('migration_' + field, positive, mutate=lambda s, f=field: s['event']['migration'].__setitem__(f, 'legacy'), expected='native_migration_' + field, coherent=True)
    def omit_condition(s):
        o = s['source']['observation']
        o.update(required_conditions=['condition:a'], cleared_conditions=['condition:a'] if name == 'wizard.unblocked' else [],
                 next_steps=[dict(step_ref='step:topic-a', prevented_by=[] if name == 'wizard.unblocked' else ['condition:a'])])
        if name == 'wizard.unblocked':
            s['authority']['actions'][s['event']['payload']['resolution_source']].update(remaining_before=['condition:a'], cleared_conditions=['condition:a'])
        sync_payload(s)
    add('omitted_original_required_condition', updated, mutate=omit_condition, expected='episode_required_conditions')
    if name == 'wizard.unblocked':
        add('lost_completed_repair_history', updated, mutate=edit_obs(lambda o: o.update(completed_repair_attempt_refs=[])), expected='repair_history')
        def foreign_root(s):
            other = base('wizard.blocked')
            other['event']['payload']['observation_id'] = 'observation:other-root'
            other['source']['observation']['observation_id'] = 'observation:other-root'
            other['event']['sequence_id'] = 9
            reidentify(other)
            root = other['event']['event_id']
            s['authority']['sources'][root] = copy.deepcopy(other['source'])
            s['authority']['available_refs'] += other['authority']['available_refs']
            s['event']['payload']['blocked_event_id'] = root
            seal(s)
        add('foreign_original_blockage', positive, mutate=foreign_root, expected='foreign_original_blockage')
    for field in ('project_id', 'planning_run_id', 'blockage_id'):
        def foreign_predecessor(s, field=field):
            from pm_dcw_event_fixtures import replace
            other = base('wizard.blocked')
            old = other['event']['payload'][field]
            other = replace(other, {old: 'foreign:' + field, 'route:planning-run-a': 'route:foreign:' + field,
                                    'puppetmaster://planning-run-a': 'puppetmaster://foreign/' + field})
            other['event']['sequence_id'] = 9
            reidentify(other)
            root = other['event']['event_id']
            s['authority']['sources'][root] = copy.deepcopy(other['source'])
            for k in ('routes', 'observations'):
                s['authority'][k].update(copy.deepcopy(other['authority'][k]))
            for k in ('readable_projects', 'available_refs', 'permission_snapshots'):
                s['authority'][k] += copy.deepcopy(other['authority'][k])
            s['event']['payload']['predecessor_event_id'] = root
            if name == 'wizard.unblocked': s['event']['payload']['blocked_event_id'] = root
            s['event'].update(causation_event_id=root, parent_event_id=root)
            s['control']['latest_predecessor_event_id'] = root
            seal(s)
        add('predecessor_join_' + field, positive, mutate=foreign_predecessor, expected='predecessor_' + field)
    for label, value in [('missing_zone', '2026-11-05T06:00:00'), ('wrong_separator', '2026/11/05T06:00:00Z'),
                         ('month_range', '2026-13-05T06:00:00Z'), ('hour_range', '2026-11-05T24:00:00Z'),
                         ('trailing_lf', '2026-11-05T06:00:00Z\n'), ('empty_fraction', '2026-11-05T06:00:00.Z')]:
        def bad_time(s, value=value):
            s['source']['observation']['ts'] = value
            sync_payload(s)
        add('malformed_time_' + label, positive, mutate=bad_time, expected='schema')
    if name == 'wizard.blocked':
        def cycle(s):
            eid = s['event']['event_id']
            s['event']['payload']['predecessor_event_id'] = eid
            s['event'].update(causation_event_id=eid, parent_event_id=eid)
            s['source']['prepared_event'] = copy.deepcopy(s['event'])
            s['authority']['sources'][eid] = copy.deepcopy(s['source'])
            seal(s)
        add('source_cycle', positive, 'read', cycle, 'source_cycle')
    return result
