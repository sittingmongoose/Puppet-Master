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

# Sweep part 2A guard tables (Method B, scripts/pm_guard_isolation.py).
if str(ROOT / 'scripts') not in sys.path:
    sys.path.insert(0, str(ROOT / 'scripts'))
import pm_dg6a_table_concern_scope as _concern_scope_table  # noqa: E402
import pm_dg6a_tables as tables  # noqa: E402
import pm_dg6a_p2a_witnesses as p2a_witnesses  # noqa: E402
import pm_dg6a_p2b_witnesses as p2b_witnesses  # noqa: E402

_CONCERN_SCOPE_ROWS = [(name, guard.predicate) for name, guard in _concern_scope_table.case(None).table.guards.items()]
CONCERN_SCOPE_RECORDER = None
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
    """Refuses only through the sch_concern_payload row."""
    found = list(Draft202012Validator(schema).iter_errors(value))
    return found if tables.first('sch_concern_payload', schema_errors=len(found)) else []


CONCERN_OPERATION_PHASES = ('concern_identity', 'concern_command_keys_a', 'concern_command_keys_b', 'concern_command_keys_entailed',
                            'concern_operation_joins',
                            'concern_record_a', 'concern_record_b')


def operation_observation(value):
    """Facts of every CONCERN_OPERATION_PHASES table for a schema- and size-accepted operation.

    The original_command schema is closed (main checks the per-field rows cover
    every command field the payload also declares); a field absent from the
    command or the payload holds.
    """
    payload, command, record = value['payload'], value['original_command'], value['candidate_record']
    h = hashlib.sha256(shared.semantic_packed([value['storage_instance_id'], value['project_id'], 'concern.created', value['idempotency_key']])).hexdigest()
    cid = 'concern_' + h
    facts = {'concern_identity': dict(
        operation_digest_exact=value['operation_digest'] == h, event_id_exact=value['event_id'] == 'evt_concern_created_' + h,
        concern_id_exact=payload['concern_id'] == cid, request_digest_exact=value['request_digest'] == digest(value),
        partition_exact=value['scope_partition'] == 'project~' + base64.urlsafe_b64encode(value['project_id'].encode()).decode().rstrip('='))}
    for part in ('a', 'b', 'entailed'):
        facts['concern_command_keys_' + part] = {
            key: key not in command or key not in payload or not (command[key] != payload[key])
            for key in tables.fields('concern_command_keys_' + part)}
    facts['concern_operation_joins'] = dict(
        payload_project=value['project_id'] == payload['project_id'], record_project=payload['project_id'] == record['project_id'],
        key_exact=value['idempotency_key'] == payload['idempotency_key'], creator_exact=payload['actor_ref'] == payload['created_by_ref'],
        record_ref_exact=payload['concern_record_ref'] == f"pmref:concern_record:{value['project_id']}/{cid}/r1")
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
    for part in ('a', 'b'):
        facts['concern_record_' + part] = {key: not (record[key] != expected[key]) for key in tables.fields('concern_record_' + part)}
    return facts


def operation_errors(value, schema, payload_schema):
    """Refuses only through sch_concern_operation, concern_operation_size, sch_concern_operation_payload
    and CONCERN_OPERATION_PHASES rows."""
    found = list(Draft202012Validator(schema, format_checker=FormatChecker()).iter_errors(value))
    if tables.first('sch_concern_operation', schema_errors=len(found)):
        return found
    code = tables.first('concern_operation_size', encoded_bytes=shared.encoded_size(value))
    if code:
        return [code]
    payload_found = list(Draft202012Validator(payload_schema, format_checker=FormatChecker()).iter_errors(value['payload']))
    found = payload_found if tables.first('sch_concern_operation_payload', schema_errors=len(payload_found)) else []
    facts = operation_observation(value)
    for phase in CONCERN_OPERATION_PHASES:
        found += tables.every(phase, **facts[phase])
    return found


def protocol_errors(context, original):
    """Synthetic authority/source joins only. Native authentication remains NOT_RUN.

    Refuses only through protocol_shape, writer_policy, concern_protocol_flags,
    concern_existence, concern_authority, concern_creator and append_result rows.
    """
    shape = shared.protocol_shape(context, original, 'concern')
    if shape:
        return [shape]
    found = shared.writer_policy_errors(context['replay_policy'])
    found += tables.every('concern_protocol_flags', **{key: context[key] is True for key in
                                                       ('admitted', 'authority_verified', 'source_current', 'permission_allowed')})
    prepared = original['state'] == 'prepared'
    found += tables.every('concern_existence', subject_bool=type(context['subject_already_active']) is bool,
                          key_bool=type(context['concern_key_exists']) is bool, prepared=prepared,
                          subject_absent=context['subject_already_active'] is False, key_absent=context['concern_key_exists'] is False)
    command = original['original_command']
    found += tables.every('concern_authority', **{key: not (context['authority'][key] != command[key])
                                                  for key in tables.fields('concern_authority')})
    creator = context['authority']['creator_kind']
    found += tables.every('concern_creator', creator_string=type(creator) is str,
                          creator_allowed=type(creator) is str and creator in CREATORS,
                          receipt_exact=context['receipt_event_id'] == original['event_id'],
                          retry_digest_exact=context['retry_digest'] == original['request_digest'],
                          caller_body_exact=shared.exact_value(context['retry_body'], caller_body(command)),
                          publication_current=context['publication_state'] == 'current')
    found += shared.append_result_errors(original, context.get('append_resolution'), context.get('append_original'), 'concern.created')
    return found


def payload_schema_entailment(op_schema, payload_schema):
    """sch_concern_operation_payload is entailed: the operation schema embeds this payload schema.

    The embedded payload (and its payload_* $defs) equals the payload schema after the
    $defs renaming, so sch_concern_operation refuses every payload defect first.
    """
    defs = {k[len('payload_'):]: v for k, v in op_schema['$defs'].items() if k.startswith('payload_')}
    def rename(node):
        if type(node) is dict:
            return {k: ('#/$defs/' + v[len('#/$defs/payload_'):] if k == '$ref' and type(v) is str and v.startswith('#/$defs/payload_')
                        else rename(v)) for k, v in node.items()}
        if type(node) is list:
            return [rename(v) for v in node]
        return node
    embedded = dict(rename(op_schema['properties']['payload']), **{'$defs': rename(defs)})
    standalone = {k: v for k, v in payload_schema.items() if k not in ('$schema', '$id')}
    assert {k: v for k, v in embedded.items() if k not in ('$schema', '$id')} == standalone, 'embedded payload schema drifted'
    return 1


def concern_result(context, original):
    """A current retry uses the frozen original, never a newly created record/result."""
    if protocol_errors(context, original):
        raise ValueError('concern request unavailable')
    return dict(action={'prepared': 'create', 'committed': 'recover_original_append',
                        'settled': 'return_original'}[original['state']],
                record_ref=original['payload']['concern_record_ref'], result_ref=original['result_ref'],
                dispatch_receipt_ref=original['dispatch_receipt_ref'],
                original_append_result_ref=original['original_append_result_ref'])


def concern_scope_observation(value):
    """The concern_scope table's FIELDS; project is a string post-schema."""
    expected = 'project~' + base64.urlsafe_b64encode(value['project_id'].encode()).decode().rstrip('=')
    return {'scope_partition_exact': bool(value['scope_partition'] == expected)}


def checkpoint_errors(value, schema, original_context):
    found = shared.checkpoint_errors(value, schema, original_context)
    if not found:
        # The scope tail refuses only through pm_dg6a_table_concern_scope.py.
        observed = concern_scope_observation(value)
        first = None
        for name, predicate in _CONCERN_SCOPE_ROWS:
            code = predicate(observed, None)
            if code is not None:
                first = (name, code)
                break
        if CONCERN_SCOPE_RECORDER is not None:
            CONCERN_SCOPE_RECORDER.append((copy.deepcopy(observed), first))
        if first:
            found.append(first[1])
    return found


def checkpoint_scope_cases(checkpoint, schema, original):
    """One-defect checkpoint-scope controls through the complete wrapper.

    The coherent negatives move the original operation's scope_partition
    with the checkpoint's, so only the scope derivation refuses.
    """
    assert not checkpoint_errors(checkpoint, schema, original)
    cases = (
        ('coherent_app_scope', 'app'),
        ('coherent_foreign_partition', 'project~AAAA'),
    )
    for name, scope in cases:
        value = copy.deepcopy(checkpoint)
        context = copy.deepcopy(original)
        value['scope_partition'] = scope
        context['scope_partition'] = scope
        actual = checkpoint_errors(value, schema, context)
        assert actual == ['Project checkpoint partition mismatch'], (name, actual)
    return 1 + len(cases)


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
    # First-validator probes are standalone payloads. They carry no frozen
    # command/record copies or request commitment that a mutation could stale.
    for case in fixture['payload_cases']:
        assert (not payload_errors(case['value'], payload_schema)) == case['valid'], case['name']
        count += 1
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
    count += checkpoint_scope_cases(checkpoint, cp_schema, original)
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
    count += shared.checkpoint_encoding_entailment(cp_schema)
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
    # Sweep part 2A one-defect witnesses for rows no earlier case refused alone.
    count += p2a_witnesses.concern_all(sys.modules[__name__], tables, fixture, payload_schema, op_schema, context,
                                       lambda request, expected: historical_concern_page(request, expected, payload_schema, cp_schema))
    # Sweep part 2B witnesses (CV-1101 date-time through the validator, SP-1101 history custody).
    count += p2b_witnesses.datetime_payload(lambda p: payload_errors(p, payload_schema),
                                            lambda p: list(Draft202012Validator(payload_schema).iter_errors(p)),
                                            next(c['value'] for c in fixture['payload_cases'] if c['valid']))
    base, expected = shared.history_request(fixture, checkpoint), copy.deepcopy(fixture['history']['expected'])
    for publication in (base['checkpoint'], expected['checkpoint']):
        publication['index_read_token']['checkpoint_ref'] = fixture['history']['case_checkpoint_ref']
    count += p2b_witnesses.history_all(base, expected, lambda request, original: historical_concern_page(
        request, original, payload_schema, cp_schema), shared.HistoryUnavailable, 'concern.created')
    count += payload_schema_entailment(op_schema, payload_schema)
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
