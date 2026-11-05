#!/usr/bin/env python3
"""DG6A concern.created static contract oracles; no native/admission authority."""
import base64
import argparse
import copy
import hashlib
import importlib.util
import json
import sys
from pathlib import Path
from jsonschema import Draft202012Validator, FormatChecker

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('dg6a_concern_shared', ROOT / 'scripts/pm-alert-event-contracts-check.py')
shared = importlib.util.module_from_spec(spec)
spec.loader.exec_module(shared)
packed = shared.packed
Draft202012Validator = shared.Draft202012Validator
CREATORS = {'Runtime', 'Package Overseer', 'Seam Overseer', 'Corroboration', 'Graph Patch'}


def load(path):
    return shared.domain.loads((ROOT / path).read_text())


def digest(value):
    return hashlib.sha256(shared.semantic_packed(dict(original_command=value['original_command'],
                                     candidate_payload=value['payload'], candidate_record=value['candidate_record']))).hexdigest()


def caller_body(command):
    """UCC-147's six caller fields; title_ref commits to exact original title bytes.

    Accepted time, record/result, Storage metadata and current owner classifications
    are retained-original evidence, never new caller inputs to dedupe comparison.
    """
    return {key: copy.deepcopy(command[key]) for key in
            ('project_id', 'title_ref', 'severity', 'category', 'source_refs', 'idempotency_key')}


def payload_errors(value, schema):
    return list(Draft202012Validator(schema).iter_errors(value))


def operation_errors(value, schema, payload_schema):
    found = list(Draft202012Validator(schema, format_checker=FormatChecker()).iter_errors(value))
    if found:
        return found
    if len(packed(value)) > 16384:
        found.append('operation exceeds 16384 bytes')
    if found:
        return found
    payload, command, record = value['payload'], value['original_command'], value['candidate_record']
    found += list(Draft202012Validator(payload_schema, format_checker=FormatChecker()).iter_errors(payload))
    h = hashlib.sha256(shared.semantic_packed([value['storage_instance_id'], value['project_id'], 'concern.created', value['idempotency_key']])).hexdigest()
    cid = 'concern_' + h
    if (value['operation_digest'], value['event_id'], payload['concern_id']) != (h, 'evt_concern_created_' + h, cid):
        found.append('original identity mismatch')
    if value['request_digest'] != digest(value):
        found.append('frozen command/payload/record digest mismatch')
    if value['scope_partition'] != 'project~' + base64.urlsafe_b64encode(value['project_id'].encode()).decode().rstrip('='):
        found.append('Project partition mismatch')
    for key in command:
        if key in payload and command[key] != payload[key]:
            found.append('original command/payload ' + key)
    if not (value['project_id'] == payload['project_id'] == record['project_id'] and
            value['idempotency_key'] == payload['idempotency_key']):
        found.append('original scope/key mismatch')
    if payload['actor_ref'] != payload['created_by_ref']:
        found.append('creator/actor mismatch')
    if payload['concern_record_ref'] != f"pmref:concern_record:{value['project_id']}/{cid}/r1":
        found.append('original revision-one record ref mismatch')
    expected = dict(record_id=cid, concern_id=cid, revision=1, status='active',
                    concern_category=command['category'], severity=command['severity'],
                    owner_kind=command['owner_kind'], owner_ref=command['owner_ref'],
                    creator_ref=command['actor_ref'], created_by_ref=command['actor_ref'], created_by_kind=command['creator_kind'],
                    subject_ref=command['subject_ref'], source_event_refs=command['source_refs'],
                    evidence_refs=command['evidence_refs'], artifact_refs=command['artifact_refs'], lineage_refs=command['lineage_refs'],
                    summary=command['title_ref'], created_at=command['ts'], updated_at=command['ts'],
                    visibility_level=command['visibility_level'], attention_level=command['attention_level'],
                    chatworthy=command['chatworthy'], blocking_effect_ref=command['blocking_effect_ref'],
                    run_ref=command['run_ref'], scope_ref=command['scope_ref'],
                    resolution_kind=None, resolver_ref=None, resolved_at=None)
    for key, expected_value in expected.items():
        if record[key] != expected_value:
            found.append('original candidate record ' + key)
    return found


def protocol_errors(context, original):
    """Synthetic authority/source joins only. Native authentication remains NOT_RUN."""
    if not shared.protocol_shape(context, original, 'concern'):
        return ['invalid protocol shape']
    found = shared.writer_policy_errors(context['replay_policy'])
    for key in ('admitted', 'authority_verified', 'source_current', 'permission_allowed'):
        if context[key] is not True:
            found.append(key)
    if any(type(context[key]) is not bool for key in ('subject_already_active', 'concern_key_exists')):
        found.append('invalid concern existence proof')
    if original['state'] == 'prepared' and (context['subject_already_active'] is not False or context['concern_key_exists'] is not False):
        found.append('existing concern cannot be recreated')
    command = original['original_command']
    for key in ('actor_ref', 'creator_kind', 'project_id', 'authority_basis_ref', 'currentness_basis_ref', 'permission_snapshot_ref', 'source_refs'):
        if context['authority'][key] != command[key]:
            found.append('independent authority ' + key)
    if type(context['authority']['creator_kind']) is not str or context['authority']['creator_kind'] not in CREATORS:
        found.append('nomination or owner label grants no creation')
    if context['receipt_event_id'] != original['event_id']:
        found.append('wrong original receipt')
    if context['retry_digest'] != original['request_digest']:
        found.append('idempotency_conflict')
    if not shared.exact_value(context['retry_body'], caller_body(command)):
        found.append('changed caller semantic body')
    if context['publication_state'] != 'current':
        found.append('withdrawn History')
    found += shared.append_result_errors(original, context['append_resolution'], context['append_original'], 'concern.created')
    return found


def concern_result(context, original):
    """A current retry uses the frozen original, never a newly created record/result."""
    if protocol_errors(context, original):
        raise ValueError('concern request unavailable')
    return dict(action={'prepared': 'create', 'committed': 'recover_original_append',
                        'settled': 'return_original'}[original['state']],
                record_ref=original['payload']['concern_record_ref'], result_ref=original['result_ref'],
                dispatch_receipt_ref=original['dispatch_receipt_ref'],
                original_append_result_ref=original['original_append_result_ref'])


def checkpoint_errors(value, schema, original_context):
    found = shared.checkpoint_errors(value, schema, original_context)
    if not found:
        expected = 'project~' + base64.urlsafe_b64encode(value['project_id'].encode()).decode().rstrip('=')
        if value['scope_partition'] != expected:
            found.append('Project checkpoint partition mismatch')
    return found


def historical_concern_page(request, expected, payload_schema, cp_schema):
    schemas = {(payload_schema['properties']['schema_id']['const'], '1.0.0'): payload_schema}
    return shared.historical_page(request, expected, schemas, cp_schema, checkpoint_errors, 'concern.created')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--family', choices=['concern.created'])
    parser.parse_args()
    fixture = load('Plans/concern_created_contracts/concern_created.fixtures.json')
    family = load('Plans/concern_created_contracts/manifest.json')['families'][0]
    isolated_count = shared.isolated_cases('concern', sys.modules[__name__], family, fixture)
    payload_schema = load(family['payload_schema'])
    op_schema = load('Plans/concern_created_contracts/concern_created_operation.schema.json')
    cp_schema = load('Plans/concern_created_contracts/concern_created_checkpoint.schema.json')
    record_schema = load('Plans/concern_created_contracts/concern_record.schema.json')
    for schema in (payload_schema, op_schema, cp_schema, record_schema):
        shared.check_schema(schema)
    original = fixture['settled_operation']
    assert not operation_errors(original, op_schema, payload_schema)
    count = 1 + isolated_count
    count += shared.producer_cases(fixture, 'concern.created', original['payload'])
    for schema in (payload_schema, op_schema, cp_schema, record_schema):
        count += shared.pattern_leaf_cases(schema)
    authority = {key: original['original_command'][key] for key in (
        'actor_ref', 'creator_kind', 'project_id', 'authority_basis_ref', 'currentness_basis_ref', 'permission_snapshot_ref', 'source_refs')}
    context = dict(admitted=True, authority_verified=True, source_current=True, permission_allowed=True,
                   authority=authority, subject_already_active=False, concern_key_exists=False,
                   receipt_event_id=original['event_id'], retry_digest=original['request_digest'],
                   publication_state='current', replay_policy='dedupe_by_idempotency_key')
    context.update(shared.append_context(fixture, 'concern.created'), retry_body=caller_body(original['original_command']))
    assert not protocol_errors(context, original)
    assert set(fixture['authorized_creators']) == CREATORS
    for creator in fixture['authorized_creators']:
        value, proof = copy.deepcopy(original), copy.deepcopy(context)
        value['original_command']['creator_kind'] = creator
        value['candidate_record']['created_by_kind'] = creator
        value['request_digest'] = digest(value)
        proof['authority']['creator_kind'] = creator
        proof['retry_digest'] = value['request_digest']
        assert not operation_errors(value, op_schema, payload_schema)
        assert not protocol_errors(proof, value)
        count += 1
    for owner in ('User', 'External Resource', 'Recovery'):
        value = copy.deepcopy(original)
        for section in ('original_command', 'payload', 'candidate_record'):
            value[section]['owner_kind'] = owner
        value['request_digest'] = digest(value)
        assert not operation_errors(value, op_schema, payload_schema)
        count += 1
    for creator in fixture['forbidden_direct_creators']:
        value, proof = copy.deepcopy(original), copy.deepcopy(context)
        value['original_command']['creator_kind'] = creator
        value['candidate_record']['created_by_kind'] = creator
        value['request_digest'] = digest(value)
        proof['authority']['creator_kind'] = creator
        proof['retry_digest'] = value['request_digest']
        assert operation_errors(value, op_schema, payload_schema)
        assert protocol_errors(proof, value)
        count += 1
    for case in fixture['writer_policy_cases']:
        assert (not shared.writer_policy_errors(case['policy'])) == case['valid']
        count += 1
    mutations = [('admitted', False), ('authority_verified', False), ('source_current', False),
                 ('permission_allowed', False),
                 ('receipt_event_id', 'foreign'), ('retry_digest', 'f' * 64), ('publication_state', 'withdrawn'),
                 ('replay_policy', 'projector_replay_only')]
    for key, bad in mutations:
        proof = copy.deepcopy(context)
        proof[key] = bad
        assert protocol_errors(proof, original), key
        count += 1
    # Presence is a successful creation's normal postcondition, not a retry conflict.
    for state in ('prepared', 'committed', 'settled'):
        retained = copy.deepcopy(original)
        retained['state'] = state
        if state != 'settled':
            retained['original_append_result_ref'] = None
        if state == 'prepared':
            for key in ('owner_commit_ref', 'result_ref', 'dispatch_receipt_ref'):
                retained[key] = None
        for present in (False, True):
            proof = dict(context, concern_key_exists=present, subject_already_active=present)
            if state == 'prepared' and present:
                assert protocol_errors(proof, retained) == ['existing concern cannot be recreated']
            else:
                result = concern_result(proof, retained)
                assert result['action'] == {'prepared': 'create', 'committed': 'recover_original_append', 'settled': 'return_original'}[state]
                assert result['record_ref'] == original['payload']['concern_record_ref']
                assert result['result_ref'] == retained['result_ref']
            count += 1
    for key, bad in [('actor_ref', 'pmref:foreign:actor'), ('creator_kind', 'Package Overseer'), ('project_id', 'foreign'),
                     ('authority_basis_ref', 'pmref:foreign:authority'), ('currentness_basis_ref', 'pmref:foreign:current'),
                     ('permission_snapshot_ref', 'pmref:foreign:permission'), ('source_refs', ['pmref:foreign:source'])]:
        proof = copy.deepcopy(context)
        proof['authority'][key] = bad
        assert protocol_errors(proof, original), key
        count += 1
    # Each frozen payload field must participate, even if no duplicate exists in command/record.
    for section, field, bad in [('payload', 'ts', '2026-11-04T19:00:00Z'),
                                ('payload', 'origin', 'api'), ('original_command', 'title_ref', 'pmref:foreign:title'),
                                ('candidate_record', 'summary', 'pmref:foreign:summary'),
                                ('candidate_record', 'status', 'dismissed'), ('payload', 'concern_revision', 2),
                                ('candidate_record', 'created_by_ref', 'pmref:foreign:creator')]:
        value = copy.deepcopy(original)
        value[section][field] = bad
        if section == 'payload' and field == 'ts':
            value['original_command']['ts'] = bad
            value['candidate_record'].update(created_at=bad, updated_at=bad)
        elif section == 'payload' and field == 'origin':
            value['original_command']['origin'] = bad
        elif section == 'original_command' and field == 'title_ref':
            value['candidate_record']['summary'] = bad
        else:
            value['request_digest'] = digest(value)
        assert operation_errors(value, op_schema, payload_schema), (section, field)
        count += 1
    for state in ('prepared', 'committed'):
        value = copy.deepcopy(original)
        value['state'] = state
        for field in ('owner_commit_ref', 'result_ref', 'dispatch_receipt_ref', 'original_append_result_ref'):
            if state == 'prepared' or field == 'original_append_result_ref':
                value[field] = None
        assert not operation_errors(value, op_schema, payload_schema)
        count += 1
    for field, bad in [('event_id', 'reminted'), ('original_append_result_ref', None), ('scope_partition', 'fixture'), ('prior_record', {})]:
        value = copy.deepcopy(original)
        value[field] = bad
        assert operation_errors(value, op_schema, payload_schema), field
        count += 1
    count += shared.trailing_lf_cases(original, op_schema)
    count += shared.trailing_lf_cases(original['payload'], payload_schema)
    checkpoint = fixture['checkpoint']
    assert not checkpoint_errors(checkpoint, cp_schema, original)
    count += shared.historical_reader_cases(fixture, checkpoint, lambda request, expected:
        historical_concern_page(request, expected, payload_schema, cp_schema))
    for case in fixture['history']['cases']:
        if case['valid'] and case['path'][0] == 'live':
            request = shared.history_request(fixture, checkpoint)
            shared.history_patch(request, case)
            fresh = dict(original, state='prepared')
            assert protocol_errors(dict(context, **request['live']), fresh), ('fresh writer should refuse', case['name'])
            assert not protocol_errors(dict(context, **request['live']), original), ('settled retry should return original', case['name'])
            count += 1
    count += shared.checkpoint_context_cases(checkpoint, cp_schema, original, checkpoint_errors)
    count += shared.trailing_lf_cases(checkpoint, cp_schema)
    for field, bad in [('scope_partition', 'fixture'), ('event_refs', ['event'])]:
        value = copy.deepcopy(checkpoint)
        value[field] = bad
        assert checkpoint_errors(value, cp_schema, original)
        count += 1
    value = copy.deepcopy(checkpoint)
    value['index_read_token']['storage_instance_id'] = '00000000-0000-4000-8000-000000000002'
    assert checkpoint_errors(value, cp_schema, original)
    value = copy.deepcopy(checkpoint)
    value['index_read_token']['redb_snapshot_id'] = 'forbidden'
    assert checkpoint_errors(value, cp_schema, original)
    count += 2
    count += shared.history_response_cases(checkpoint, cp_schema, 'concern.created', 'fixture', original)
    value = copy.deepcopy(checkpoint)
    value['index_read_token']['checkpoint_ref'] += 'x' * 16384
    assert checkpoint_errors(value, cp_schema, original)
    count += 1
    events = [dict(sequence_id=i + 1, event_type='concern.created' if i < 1000 else 'other',
                   project_id='fixture', event_ref='event_' + str(i)) for i in range(2000)]
    cursor, refs, complete = 0, [], False
    while not complete:
        response = shared.history_page(events, 'concern.created', 'fixture', cursor, 2000,
                                       checkpoint['publication_id'], checkpoint['index_read_token'])
        assert response['after_sequence_id'] > cursor and len(packed(response)) <= 16384
        cursor, complete = response['after_sequence_id'], response['complete']
        refs += response['event_refs']
    assert len(refs) == len(set(refs)) == fixture['history_match_count']
    count += 1
    admitted = {row['event_type'] for row in load('Plans/event_family_registry.json')['families']}
    assert 'concern.created' not in admitted
    registry = load('Plans/storage_value_registry.json')
    for fid, schema in [('concern_record', record_schema), ('concern_created_operation', op_schema), ('concern_created_checkpoint', cp_schema)]:
        row = next(row for row in registry['families'] if row['family_id'] == fid)
        shared.check_schema(row['value_schema'])
        assert row['value_schema'] == {k: v for k, v in schema.items() if k != '$schema'}
        assert row['retention_policy_ref'] == ('RP-AUTHORITY-INDEFINITE' if fid == 'concern_record' else 'PENDING_RETENTION_DECISION')
        group = 'event_log' if fid.endswith('checkpoint') else ('runs_and_goals' if fid == 'concern_record' else 'coordination_and_storage')
        assert not shared.profile_errors(registry, fid, row['storage_kind'], group)
        missing = copy.deepcopy(registry)
        del missing['storage_profile']['family_profiles'][fid]
        assert shared.profile_errors(missing, fid, row['storage_kind'], group)
        count += 2
    text = (ROOT / 'Plans/storage-plan.md').read_text().split('### SP-666 -', 1)[1].split('\n### ', 1)[0]
    for required in ('concern.created', 'cmd.concern.create', 'handlers::concern::create', 'SP-278', 'SP-286', 'CV-339',
                     'storage.first_append_receipt.resolve.v2', 'PENDING_RETENTION_DECISION', '16384', 'projector_replay_only', 'SP-337'):
        assert required in text, required
    print(json.dumps(dict(status='pass', families=1, cases=count, admission='ABSENT', native='NOT_RUN', retention='PENDING_RETENTION_DECISION')))


if __name__ == '__main__':
    main()
