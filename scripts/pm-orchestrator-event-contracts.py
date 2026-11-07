#!/usr/bin/env python3
"""DO static contract checks; no admission or native runtime proof."""
import copy
import base64
import hashlib
import importlib.util
import json
import re
import rfc8785
import sys
from pathlib import Path
from jsonschema import Draft202012Validator
import pm_orchestrator_event_oracles as oracles

ROOT = Path(__file__).resolve().parents[1]
UTC_FORMAT = oracles.UTC_FORMAT


def observation_component(family, payload):
    return rfc8785.dumps(['ea-do-observation-v1', payload['operation_id'], payload['thread_id'],
                          payload['run_id'], family, payload['occurrence']]).decode('utf-8')


def identity(family, payload):
    partition = 'app'
    if payload['scope'] == 'project':
        partition = 'project~' + base64.urlsafe_b64encode(payload['project_id'].encode()).decode().rstrip('=')
    parts = ['ea-do-v1', partition, payload['server_id'], payload['thread_id'], payload['run_id'], family, payload['operation_id'], payload['occurrence']]
    # Use the specified serializer for every accepted numeric/string representation.
    digest = hashlib.sha256(rfc8785.dumps(parts)).hexdigest()
    key = 'do1:' + digest
    if payload['scope'] == 'application':
        key = ('application@1:' + payload['server_id'].encode().hex() + ':'
               + observation_component(family, payload).encode().hex())
    return key, 'evt_do_' + digest


def historical_identity(family, payload, recipe):
    if recipe == oracles.CURRENT_RECIPE:
        return identity(family, payload)
    if recipe != oracles.LEGACY_RECIPE:
        raise ValueError('unsupported original identity recipe')
    encode = lambda value: json.dumps(value, separators=(',', ':'), ensure_ascii=False).encode('utf-8')
    parts = ['ea-do-v1', oracles.partition(payload), payload['server_id'], payload['thread_id'],
             payload['run_id'], family, payload['operation_id'], payload['occurrence']]
    digest = hashlib.sha256(encode(parts)).hexdigest()
    key = 'do1:' + digest
    if payload['scope'] == 'application':
        observation = ['ea-do-observation-v1', payload['operation_id'], payload['thread_id'],
                       payload['run_id'], family, payload['occurrence']]
        key = 'application@1:' + payload['server_id'].encode().hex() + ':' + encode(observation).hex()
    return key, 'evt_do_' + digest


def retry_allowed(context):
    """OSI-699 static transition oracle, never a native attempt dispatcher.

    Sweep part 2A: the clauses are the rows of `RETRY_TRANSITION_ROWS` (types first, through RETRY_CONTEXT); a retry
    is allowed exactly when no row refuses.
    """
    view = {'context': context, 'context_type_errors': oracles.retry_context_errors(context)}
    return not oracles.run_rows(oracles.guards.RETRY_TRANSITION_ROWS, view)

BOARD = ('crew.board_message_posted', 'crew.board_message_read', 'crew.board_messages_archived')


def board_join_view(case):
    payload, envelope = case['payload'], case['envelope']
    key, event_id = identity(case['event_type'], payload)
    return {'payload': payload, 'envelope': envelope, 'event_type': case['event_type'],
            'expected_payload_schema_id': oracles.member_payload_schema_id(case['event_type'].replace('.', '_'),
                                                                           payload.get('schema_version')),
            'expected_scope_partition': ('app' if payload['scope'] == 'application' else 'project~' + base64.urlsafe_b64encode(
                payload['project_id'].encode()).decode().rstrip('=')),
            'expected_idempotency_key': key, 'expected_event_id': event_id, 'terminal_run': case.get('terminal_run')}


def board_join_errors(case):
    """Exact source/append/run joins, using supplied canonical-source fixtures only; through the BOARD_NUMBER, BOARD
    source and BOARD_JOIN tables (sweep part 2A)."""
    numbers = {'payload_number_errors': oracles.record_number_errors(case['payload']),
               'envelope_number_errors': oracles.record_number_errors(case['envelope'])}
    errors = oracles.run_rows(oracles.guards.BOARD_NUMBER_ROWS, numbers)
    if errors:
        return errors
    errors = oracles.board_source_errors(case, ROOT, UTC_FORMAT)
    return errors + oracles.run_rows(oracles.guards.BOARD_JOIN_ROWS, board_join_view(case))

def selected_definition_checks():
    """Each selected shared definition refuses one change; an edit elsewhere in the same file does not."""
    documents = oracles.selected_documents(ROOT)
    assert not oracles.selected_definition_errors(documents), 'selected_definition_positive'
    checks = 1
    def edited(name, definition, change):
        result = dict(documents)
        result[name] = copy.deepcopy(documents[name])
        change(result[name]['$defs'], definition)
        return result
    for name, selection in oracles.SELECTED_SHARED_DEFINITIONS.items():
        for definition in selection['names']:
            tightened = edited(name, definition, lambda defs, x: defs[x].update(required=defs[x].get('required', []) + ['probe_field']))
            removed = edited(name, definition, lambda defs, x: defs.pop(x))
            assert oracles.selected_definition_errors(tightened) == ['successor_selected_definitions'], (name, definition)
            assert oracles.selected_definition_errors(removed) == ['successor_selected_definitions'], (name, definition)
            checks += 2
    # The definitions main actually changed (3a93424300) sit outside the selection: a whole-file pin
    # refresh over edits like these must not trip this guard.
    for name, definition in (('application_workflow_contracts', 'GoalCommandRequestApplicationV1'),
                             ('shared_integration_runtime', 'skill_copy_request')):
        elsewhere = edited(name, definition, lambda defs, x: defs[x].update(description='edited elsewhere'))
        assert not oracles.selected_definition_errors(elsewhere), (name, definition)
        checks += 1
    return checks


def readiness_module():
    spec = importlib.util.spec_from_file_location('readiness_do', ROOT / 'scripts/pm-implementation-readiness.py')
    readiness = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(readiness)
    return readiness


def board_member_refusal_checks(schema, fixtures, row, coordination):
    """SP-320: a board member carrying a stored schema_id is refused at every owner boundary."""
    checks = 0
    readiness = readiness_module()
    code = 'storage_value_registry_keyed_composition_payload_member_has_stored_header'
    assert not readiness.storage_value_keyed_composition_failures(row, row_path='live')
    owner_defs = json.loads((ROOT / coordination.PAYLOAD_PATH).read_text())['$defs']
    assert not coordination.board_member_definition_failures(owner_defs, schema['$defs'])
    checks += 2
    event_cases = [c for c in fixtures['event_cases'] if c['event_type'] in BOARD]
    assert {c['event_type'] for c in event_cases} == set(BOARD)
    for family in BOARD:
        name = family.replace('.', '_')
        header = {'const': f'pm.event_payload.{name}.v1'}
        # The specific readiness code, alone: the stored header is the only defect, so the row's field
        # list names it too, in both the optional and the required form of the member.
        for required in (False, True):
            bad = copy.deepcopy(row)
            member = bad['value_schema']['$defs'][name]
            member['properties']['schema_id'] = copy.deepcopy(header)
            member['required'] = member['required'] + (['schema_id'] if required else [])
            bad['optional_fields'] = bad['optional_fields'] + ['schema_id']
            failures = readiness.storage_value_keyed_composition_failures(bad, row_path='negative')
            assert [(f['error'], f.get('member')) for f in failures] == [(code, name)], (family, failures)
            checks += 1
        # The coordination checker refuses the owner file's copy, with both files changed alike so the
        # stored header is the only defect, and refuses drift between the two files separately.
        owner = copy.deepcopy(owner_defs); orchestrator = copy.deepcopy(schema['$defs'])
        for definitions in (owner, orchestrator):
            definitions[name]['properties']['schema_id'] = copy.deepcopy(header)
        assert [f['error'] for f in coordination.board_member_definition_failures(owner, orchestrator)] == ['board_member_stored_header'], family
        owner = copy.deepcopy(owner_defs); owner[name]['properties']['subject_probe'] = {'type': 'string'}
        assert [f['error'] for f in coordination.board_member_definition_failures(owner, schema['$defs'])] == ['board_member_copy_drift'], family
        owner = copy.deepcopy(owner_defs); owner[name]['$id'] = 'pm.event_payload.foreign.v1'
        assert [f['error'] for f in coordination.board_member_definition_failures(owner, schema['$defs'])] == ['board_member_schema_id'], family
        owner = copy.deepcopy(owner_defs); del owner[name]
        assert [f['error'] for f in coordination.board_member_definition_failures(owner, schema['$defs'])] == ['board_member_definition_missing'], family
        checks += 4
    stored_validator = Draft202012Validator(row['value_schema'], format_checker=UTC_FORMAT)
    for base in event_cases:
        name = base['definition']
        stored = dict(base['logical_payload'], schema_id=f'pm.event_payload.{name}.v1')
        # Payload boundaries: the closed owner definition and the stored composition.
        assert list(oracles.StrictValidator(schema['$defs'][name], format_checker=UTC_FORMAT).iter_errors(stored)), base['case_id']
        assert list(stored_validator.iter_errors(stored)), base['case_id']
        # Append, retry and history refuse it, with the digests kept in step so that is the only defect.
        bad = copy.deepcopy(base); bad['logical_payload'] = stored; bad['event']['payload'] = copy.deepcopy(stored)
        bad = oracles.recapture_history(bad)
        assert oracles.event_errors(bad, schema, identity, retry_allowed, ROOT, UTC_FORMAT) == ['logical_payload_schema'], base['case_id']
        assert oracles.historical_read_errors(bad, schema, sys.modules[__name__]) == ['logical_payload_schema'], base['case_id']
        assert oracles.retry_outcome(base['event'], bad['event'])['status'] == 'retry_value_schema', base['case_id']
        checks += 5
    for test in fixtures['board_successor_cases']:
        if test.get('kind') == 'stored_schema_id':
            assert board_join_errors(test['case']) == ['board_member_stored_header'], test['name']
            checks += 1
    return checks


def board_storage_checks(schema, fixtures, storage, owner):
    rows = [row for row in storage['families'] if row['family_id'] == 'coordination_event_records']
    assert len(rows) == 1
    row = rows[0]
    composition = row['value_schema']
    assert not oracles.reference_errors(dict(composition, **{'$id': schema['$id'] + '/storage'}), documents=oracles.selected_documents(ROOT)), 'unresolved_schema_reference'
    validator = Draft202012Validator(composition, format_checker=UTC_FORMAT)
    checks = 0
    # Independent preservation of all original members, not only a self-derived expected row.
    spec = importlib.util.spec_from_file_location('coordination_do', ROOT / 'scripts/pm_coordination_events.py')
    coordination = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(coordination)
    expected = coordination.expected_svr_rows()['coordination_event_records']
    member = oracles.guards.COORDINATION_STORAGE_ROWS
    assert not oracles.run_rows(member, oracles.coordination_storage_view(row, expected)), 'actual_coordination_storage_member_drift'
    # Negative: the same row with one sentence back on the retired branch citation differs from the
    # expected row in that field alone, so the row above refuses a stale copy on either side.
    landed = 'is landed in this registry (Storage retention landing `4d52bd2758526cd0e8a56358baaa73049c1d4bdd`)'
    retired = 'remains on origin/plans/ea-storage-retention-20261104'
    assert row['retention_compaction'].count(landed) == 1 and retired not in row['retention_compaction']
    drifted = dict(row, retention_compaction=row['retention_compaction'].replace(landed, retired))
    assert drifted != expected and [k for k in row if drifted[k] != row[k]] == ['retention_compaction']
    assert oracles.run_rows(member, oracles.coordination_storage_view(drifted, expected)) == ['actual_coordination_storage_member_drift']
    assert oracles.run_rows(member, oracles.coordination_storage_view(row, dict(expected, retention_compaction=drifted['retention_compaction']))) == [
        'actual_coordination_storage_member_drift']
    checks += 1
    original = json.loads((ROOT / 'Plans/coordination_event_payloads.schema.json').read_text())
    for name in ['lineage_envelope', 'non_secret_ref'] + [coordination.DEF_BY_TYPE[t] for t in coordination.SEVEN] + ['debug_mirror_exported']:
        definition = copy.deepcopy(original['$defs'][name])
        definition.pop('$id', None); definition.pop('$schema', None)
        mapping = {f'{coordination.PAYLOAD_SCHEMA_URI}#/$defs/{n}': f'#/$defs/{n}' for n in original['$defs']}
        assert composition['$defs'][name] == coordination.rewrite_refs(definition, mapping), name
        checks += 1
    for family in BOARD:
        name = family.replace('.', '_')
        assert row['key_shape'].split(' | ').count(family) == 1
        assert composition['$defs'][name] == schema['$defs'][name]
        # SP-320: the member copies the file value_schema_ref names, which equals the Orchestrator definition.
        assert row['value_schema_ref'] == coordination.PAYLOAD_PATH
        definition = copy.deepcopy(original['$defs'][name])
        definition.pop('$id'); definition.pop('$schema')
        assert composition['$defs'][name] == definition
        assert 'schema_id' not in definition['properties'] and 'schema_id' not in definition['required']
        assert composition['oneOf'].count({'$ref': '#/$defs/' + name}) == 1
        checks += 6
    assert len(composition['oneOf']) == 11
    assert 'Original agent members:' in row['redaction_no_secret_rule']
    assert 'never relaxes an agent member' in row['redaction_no_secret_rule']
    storage_owner = (ROOT / 'Plans/storage-plan.md').read_text()
    for i, family in enumerate(BOARD):
        section = storage_owner.split('### SP-' + str(720 + i) + ' — ' + family, 1)[1].split('\n### ', 1)[0]
        for token in ('OriginalCoordinationAppendSource', 'SP-286', 'SP-278', 'run_completion', 'PARTIAL', 'NOT_RUN'):
            assert token in section, (family, token)
            checks += 1
    for case in fixtures['board_storage_cases']:
        selected = [c for c in fixtures['event_cases'] if c['case_id'] == case['event_case_id']]
        assert (len(selected) == 1 and selected[0]['logical_payload'] == case['payload']
                and selected[0]['event_type'] == case['event_type']
                and all(selected[0]['event'].get(key) == case['envelope'].get(key)
                        for key in ('event_id', 'idempotency_key', 'run_id', 'thread_id',
                                    'occurred_at_utc', 'project_id', 'replay_policy', 'payload_schema_id'))
                and selected[0]['scope_partition'] == case['envelope']['scope_partition']), 'board_full_append_payload_join'
        assert not oracles.transport_errors(selected[0]['event'], case['payload'], selected[0]['payload_packs']), 'board_full_append_transport'
        validator.validate(case['payload'])
        expected_errors = []
        assert board_join_errors(case) == expected_errors, (case['event_type'], board_join_errors(case))
        # No terminal source yet is a valid append, but cannot make expiry eligible.
        no_anchor = copy.deepcopy(case); no_anchor['terminal_run'] = None
        assert board_join_errors(no_anchor) == expected_errors
        checks += 3
        for target, field in [('source', 'server_id'), ('source', 'thread_id'), ('source', 'crew_id'),
                              ('source', 'run_id'), ('source', 'operation_id'), ('source', 'edition'),
                              ('source', 'interface'), ('source', 'message_ids'),
                              ('envelope', 'scope_partition'), ('envelope', 'run_id'),
                              ('envelope', 'idempotency_key'), ('envelope', 'payload_schema_id'),
                              ('terminal_run', 'run_id'),
                              ('terminal_run', 'server_id'), ('terminal_run', 'kind')]:
            bad = copy.deepcopy(case); bad[target][field] = 'foreign'
            assert set(board_join_errors(bad)) - set(expected_errors), (case['event_type'], target, field)
            checks += 1
        for field in ('schema_version', 'crew_id', 'run_id'):
            bad = copy.deepcopy(case['payload']); bad.pop(field)
            assert list(validator.iter_errors(bad)), (case['event_type'], field)
            checks += 1
        bad = copy.deepcopy(case['payload']); bad['extra_body'] = 'unowned content'
        assert list(validator.iter_errors(bad))
        checks += 1
        if case['payload']['scope'] == 'application':
            bad = copy.deepcopy(case); bad['source']['project_id'] = 'fabricated'
            assert set(board_join_errors(bad)) - set(expected_errors)
            checks += 1
        for target in ('source', 'wrapper') if case['payload']['scope'] == 'application' else ('source',):
            for field in list(case[target]):
                bad = copy.deepcopy(case); del bad[target][field]
                assert set(board_join_errors(bad)) - set(expected_errors), (case['event_type'], target, field)
                checks += 1
            bad = copy.deepcopy(case); bad[target]['foreign_field'] = 'foreign'
            assert set(board_join_errors(bad)) - set(expected_errors)
            checks += 1
        for field in list(case['source']['original_input']):
            bad = copy.deepcopy(case); del bad['source']['original_input'][field]
            assert set(board_join_errors(bad)) - set(expected_errors), (case['event_type'], 'input', field)
            checks += 1
        bad = copy.deepcopy(case); bad['source']['original_input']['foreign_field'] = 'foreign'
        assert set(board_join_errors(bad)) - set(expected_errors)
        checks += 1
    checks += board_member_refusal_checks(schema, fixtures, row, coordination)
    return checks

def main():
    schema = json.loads((ROOT / 'Plans/orchestrator_event_payloads.schema.json').read_text())
    fixtures = oracles.fixture_loads((ROOT / 'Plans/orchestrator_event_contract_fixtures.json').read_text())
    owner = (ROOT / 'Plans/orchestrator-subagent-integration.md').read_text()
    registry = json.loads((ROOT / 'Plans/event_family_registry.json').read_text())
    storage = json.loads((ROOT / 'Plans/storage_value_registry.json').read_text())
    admitted = {f['event_type'] for f in registry['families']}
    checks = 0
    assert not oracles.successor_errors(ROOT), oracles.successor_errors(ROOT)
    checks += selected_definition_checks()
    assert len(fixtures['contracts']) == 25
    assert {c['definition'] for c in fixtures['contracts']} == set(schema['$defs'])
    assert {c['event_type'] for c in fixtures['valid_payloads']} == {c['event_type'] for c in fixtures['contracts']}
    for contract in fixtures['contracts']:
        family = contract['event_type']
        assert family not in admitted, ('unexpected_admission', family)
        section = owner.split('### ' + contract['unit'] + ' — ' + family + '\n', 1)[1].split('\n### ', 1)[0]
        for token in [contract['reader'], contract['policy'], contract['producer'], contract['predicate'], 'SP-278', 'SP-286', 'none_required', 'withdrawal', 'NOT_RUN']:
            assert token in section, (family, token)
        checks += 1
    for case in fixtures['valid_payloads']:
        definition = schema['$defs'][case['definition']]
        assert not oracles.reference_errors(schema, '#/$defs/' + case['definition'], oracles.selected_documents(ROOT)), 'unresolved_schema_reference'
        Draft202012Validator.check_schema(definition)
        validator = oracles.StrictValidator(definition, format_checker=UTC_FORMAT)
        payload = case['payload']
        validator.validate(payload)
        checks += 1
        negatives = []
        for field in definition['required']:
            bad = copy.deepcopy(payload)
            del bad[field]
            negatives.append(bad)
        for field, value in [('unknown_field', 'x'), ('schema_version', '2.0.0'), ('scope', 'foreign'), ('occurrence', 0), ('occurred_at_utc', 'yesterday')]:
            bad = copy.deepcopy(payload); bad[field] = value; negatives.append(bad)
        bad = copy.deepcopy(payload)
        if case['scope'] == 'project':
            del bad['project_id']
        else:
            bad['project_id'] = 'invented-project'
        negatives.append(bad)
        for bad in negatives:
            assert list(validator.iter_errors(bad)), (case['event_type'], bad)
            checks += 1
        baseline = identity(case['event_type'], payload)
        assert baseline == (case['identity']['idempotency_key'], case['identity']['event_id'])
        assert case['identity']['scope_partition'] == oracles.partition(payload), ('scope_partition', case['event_type'])
        if case['scope'] == 'application':
            # Independently decode CV-366 fields rather than accepting any opaque hash.
            prefix, server_hex, operation_hex = baseline[0].split(':')
            assert prefix == 'application@1'
            assert bytes.fromhex(server_hex).decode() == payload['server_id']
            assert json.loads(bytes.fromhex(operation_hex).decode()) == [
                'ea-do-observation-v1', payload['operation_id'], payload['thread_id'],
                payload['run_id'], case['event_type'], payload['occurrence']]
            assert re.fullmatch(r'application@1:(?:[0-9a-f]{2})+:(?:[0-9a-f]{2})+', baseline[0])
            assert ('do1:' + baseline[1].removeprefix('evt_do_')) != baseline[0]
            section = owner.split('### ' + next(c['unit'] for c in fixtures['contracts'] if c['event_type'] == case['event_type']) + ' — ', 1)[1].split('\n### ', 1)[0]
            assert 'application@1:{hex(server_id)}:{hex(owner_operation_id)}' in section
            checks += 6
        assert identity(case['event_type'], copy.deepcopy(payload)) == baseline
        for field in ['operation_id', 'occurrence', 'server_id', 'thread_id', 'run_id']:
            bad = copy.deepcopy(payload)
            bad[field] = bad[field] + 1 if field == 'occurrence' else bad[field] + '-other'
            assert identity(case['event_type'], bad) != baseline
            checks += 1
        assert identity(case['event_type'] + '.sibling', payload) != baseline
        checks += 1
        # Same source identity returns the original full value; changing semantics
        # under it is a conflict, never a second effect or a re-keyed event.
        changed = copy.deepcopy(payload); changed['occurred_at_utc'] = '2026-11-04T00:00:01Z'
        assert identity(case['event_type'], changed) == baseline and changed != payload
        checks += 1
    posted = schema['$defs']['crew_board_message_posted']
    # Python's $ can match before a final LF. The length fence must accompany
    # the lexical pattern in the source and its actual stored composition.
    ref_id = posted['properties']['content_ref']['properties']['blake3_id']
    assert ref_id['minLength'] == ref_id['maxLength'] == 71
    checks += 1
    for scope in ('application', 'project'):
        for suffix in ('lf', 'cr', 'crlf', 'space', 'hex', 'nonhex', 'nul', 'unicode'):
            name = scope + '_ref_trailing_' + suffix
            cases = [c for c in fixtures['body_cases'] if c['name'] == name]
            assert len(cases) == 1 and cases[0]['valid'] is False, name
            assert cases[0]['payload']['scope'] == scope, name
            checks += 1
    posted_validator = Draft202012Validator(posted, format_checker=UTC_FORMAT)
    stored_validator = Draft202012Validator(next(r for r in storage['families'] if r['family_id'] == 'coordination_event_records')['value_schema'], format_checker=UTC_FORMAT)
    for case in fixtures['body_cases']:
        for validator in (posted_validator, stored_validator):
            assert (not list(validator.iter_errors(case['payload']))) == case['valid'], case['name']
            checks += 1
    for case in fixtures['retry_transition_cases']:
        assert bool(retry_allowed(case['context'])) == case['allowed'], case['name']
        checks += 1
    assert {c['context']['retry_cause'] for c in fixtures['retry_transition_cases'] if c['allowed']} == {'failure', 'blockage', 'interruption'}
    retry_section = owner.split('### OSI-699 — subagent.retried\n', 1)[1].split('\n### ', 1)[0]
    for token in ('failure, blockage, or interruption', 'permission/current parent ceiling/Stop/deadline',
                  'complete/cancelled/superseded', 'resume/reroute/replacement'):
        assert token in retry_section, token
        checks += 1
    checks += board_storage_checks(schema, fixtures, storage, owner)
    # Every family: the envelope's payload_schema_id must name this exact member, with one defect.
    for base in fixtures['event_cases']:
        sibling = next(c['definition'] for c in fixtures['contracts'] if c['definition'] != base['definition'])
        bad = copy.deepcopy(base)
        bad['event']['payload_schema_id'] = oracles.member_payload_schema_id(sibling, base['logical_payload']['schema_version'])
        assert oracles.event_errors(bad, schema, identity, retry_allowed, ROOT, UTC_FORMAT) == ['event_join_payload_schema_id'], base['case_id']
        checks += 1
    checks += oracles.check_oracles(fixtures, schema, sys.modules[__name__])
    print(json.dumps({'status': 'pass', 'families': len(fixtures['contracts']), 'checks': checks, 'native': 'NOT_RUN', 'stopped_facets': []}))

if __name__ == '__main__':
    main()
