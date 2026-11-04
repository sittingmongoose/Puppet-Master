#!/usr/bin/env python3
"""DO static contract checks; no admission or native runtime proof."""
import copy
import base64
import hashlib
import importlib.util
import json
import re
from pathlib import Path
from datetime import datetime
from jsonschema import Draft202012Validator, FormatChecker

ROOT = Path(__file__).resolve().parents[1]
UTC_FORMAT = FormatChecker()
@UTC_FORMAT.checks('date-time', raises=(ValueError, TypeError))
def utc(value):
    if not isinstance(value, str) or not value.endswith('Z'):
        return False
    datetime.fromisoformat(value.replace('Z', '+00:00'))
    return True

@UTC_FORMAT.checks('pm-utf8-body-16k', raises=(ValueError, TypeError, UnicodeError))
def inline_body(value):
    return isinstance(value, str) and len(value.encode('utf-8')) <= 16384


def observation_component(family, payload):
    return json.dumps(['ea-do-observation-v1', payload['operation_id'], payload['thread_id'],
                       payload['run_id'], family, payload['occurrence']],
                      separators=(',', ':'), ensure_ascii=False)


def identity(family, payload):
    partition = 'app'
    if payload['scope'] == 'project':
        partition = 'project~' + base64.urlsafe_b64encode(payload['project_id'].encode()).decode().rstrip('=')
    parts = ['ea-do-v1', partition, payload['server_id'], payload['thread_id'], payload['run_id'], family, payload['operation_id'], payload['occurrence']]
    # Vector values are ASCII strings/positive integers, identical in RFC8785.
    digest = hashlib.sha256(json.dumps(parts, separators=(',', ':'), ensure_ascii=False).encode()).hexdigest()
    key = 'do1:' + digest
    if payload['scope'] == 'application':
        key = ('application@1:' + payload['server_id'].encode().hex() + ':'
               + observation_component(family, payload).encode().hex())
    return key, 'evt_do_' + digest


def retry_allowed(context):
    """OSI-699 static transition oracle, never a native attempt dispatcher."""
    cause = context['retry_cause']
    prior = context['prior_state']
    source_allowed = ((cause == 'failure' and prior == 'failed')
                      or (cause == 'blockage' and prior == 'blocked')
                      or (cause == 'interruption' and prior in ('running', 'awaiting_parent', 'blocked')
                          and context['interruption_fence']))
    return (source_allowed and context['prior_terminal_reason'] != 'superseded'
            and context['permission_current'] and context['parent_ceiling_current']
            and not context['stop_latched'] and not context['deadline_expired']
            and context['same_child_lineage'] and context['operation_kind'] == 'retry'
            and context['attempt_number'] == context['prior_attempt_number'] + 1)


BOARD = ('crew.board_message_posted', 'crew.board_message_read', 'crew.board_messages_archived')


def board_join_errors(case):
    """Exact source/append/run joins, using supplied canonical-source fixtures only."""
    payload, source, envelope = case['payload'], case['source'], case['envelope']
    errors = []
    for field in ('scope', 'storage_instance_id', 'server_id', 'thread_id', 'crew_id', 'run_id', 'operation_id'):
        if source.get(field) != payload.get(field):
            errors.append('source_' + field)
    app = payload['scope'] == 'application'
    if app:
        if 'project_id' in payload or 'project_id' in source:
            errors.append('fabricated_project')
        if source.get('edition') != 'pm.application_source.coordination_append.v1@1.0.0':
            errors.append('source_edition')
        if source.get('interface') != 'storage.coordination_append.application@1.0.0':
            errors.append('append_interface')
        if source.get('message_schema') != 'pm.coordination.agent_message.application.v1@1.0.0':
            errors.append('message_edition')
    else:
        if source.get('project_id') != payload['project_id']:
            errors.append('source_project_id')
        if source.get('interface') != 'storage.coordination_append.v1@1.0.0':
            errors.append('append_interface')
        if source.get('edition') != 'original_project_coordination_source':
            errors.append('source_edition')
    expected_partition = ('app' if app else 'project~' + base64.urlsafe_b64encode(
        payload['project_id'].encode()).decode().rstrip('='))
    if envelope.get('scope_partition') != expected_partition:
        errors.append('scope_partition')
    for field in ('scope', 'run_id', 'thread_id', 'occurred_at_utc', 'project_id'):
        if envelope.get(field) != payload.get(field):
            errors.append('envelope_' + field)
    key, event_id = identity(case['event_type'], payload)
    if envelope.get('idempotency_key') != key or envelope.get('event_id') != event_id:
        errors.append('identity')
    messages = payload.get('message_ids', [payload.get('message_id')])
    if source.get('message_ids') != messages:
        errors.append('message_source')
    terminal = case.get('terminal_run')
    if terminal is not None:
        for field in ('scope', 'storage_instance_id', 'server_id', 'thread_id', 'crew_id', 'run_id', 'project_id'):
            if terminal.get(field) != payload.get(field):
                errors.append('run_anchor_' + field)
        if terminal.get('kind') != 'first_durable_terminal_canonical_run':
            errors.append('run_anchor_kind')
    return errors


def board_storage_checks(schema, fixtures, storage, owner):
    rows = [row for row in storage['families'] if row['family_id'] == 'coordination_event_records']
    assert len(rows) == 1
    row = rows[0]
    composition = row['value_schema']
    validator = Draft202012Validator(composition, format_checker=UTC_FORMAT)
    checks = 0
    # Independent preservation of all original members, not only a self-derived expected row.
    spec = importlib.util.spec_from_file_location('coordination_do', ROOT / 'scripts/pm_coordination_events.py')
    coordination = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(coordination)
    expected = coordination.expected_svr_rows()['coordination_event_records']
    assert row == expected, 'actual_coordination_storage_member_drift'
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
        assert composition['oneOf'].count({'$ref': '#/$defs/' + name}) == 1
        checks += 3
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
        validator.validate(case['payload'])
        assert not board_join_errors(case), (case['event_type'], board_join_errors(case))
        # No terminal source yet is a valid append, but cannot make expiry eligible.
        no_anchor = copy.deepcopy(case); no_anchor['terminal_run'] = None
        assert not board_join_errors(no_anchor)
        checks += 3
        for target, field in [('source', 'server_id'), ('source', 'thread_id'), ('source', 'crew_id'),
                              ('source', 'run_id'), ('source', 'operation_id'), ('source', 'edition'),
                              ('source', 'interface'), ('source', 'message_ids'),
                              ('envelope', 'scope_partition'), ('envelope', 'run_id'),
                              ('envelope', 'idempotency_key'), ('terminal_run', 'run_id'),
                              ('terminal_run', 'server_id'), ('terminal_run', 'kind')]:
            bad = copy.deepcopy(case); bad[target][field] = 'foreign'
            assert board_join_errors(bad), (case['event_type'], target, field)
            checks += 1
        for field in ('schema_id', 'crew_id', 'run_id'):
            bad = copy.deepcopy(case['payload']); bad.pop(field)
            assert list(validator.iter_errors(bad)), (case['event_type'], field)
            checks += 1
        bad = copy.deepcopy(case['payload']); bad['extra_body'] = 'unowned content'
        assert list(validator.iter_errors(bad))
        checks += 1
        if case['payload']['scope'] == 'application':
            bad = copy.deepcopy(case); bad['source']['project_id'] = 'fabricated'
            assert board_join_errors(bad)
            checks += 1
    return checks

def main():
    schema = json.loads((ROOT / 'Plans/orchestrator_event_payloads.schema.json').read_text())
    fixtures = json.loads((ROOT / 'Plans/orchestrator_event_contract_fixtures.json').read_text())
    owner = (ROOT / 'Plans/orchestrator-subagent-integration.md').read_text()
    registry = json.loads((ROOT / 'Plans/event_family_registry.json').read_text())
    storage = json.loads((ROOT / 'Plans/storage_value_registry.json').read_text())
    admitted = {f['event_type'] for f in registry['families']}
    checks = 0
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
        Draft202012Validator.check_schema(definition)
        validator = Draft202012Validator(definition, format_checker=UTC_FORMAT)
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
    print(json.dumps({'status': 'pass', 'families': len(fixtures['contracts']), 'checks': checks, 'native': 'NOT_RUN'}))

if __name__ == '__main__':
    main()
