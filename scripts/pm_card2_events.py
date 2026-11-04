#!/usr/bin/env python3
"""DCN synthetic contract oracles. No native execution or writer admission.

Every negative must fail exactly one named guard. Mutation mode removes that
actual guard and asserts both its positive sensitivity and all other refusals.
"""
from __future__ import annotations
import argparse
import base64
import copy
import json
import re
from functools import lru_cache
from pathlib import Path
from jsonschema import Draft202012Validator, FormatChecker

ROOT = Path(__file__).resolve().parents[1]
SEMANTIC_FIELDS = (
    'event_type', 'scope_kind', 'project_id', 'thread_id', 'run_id', 'node_id',
    'attempt_id', 'actor_ref', 'requested_account_ref', 'effective_account_ref',
    'occurred_at_utc', 'producer_sequence_id', 'correlation_id', 'causation_event_id',
    'parent_event_id', 'idempotency_key', 'payload_schema_id', 'payload', 'payload_ref',
    'redaction_profile', 'migration',
)

@lru_cache(maxsize=None)
def load(name):
    return json.loads((ROOT / 'Plans' / name).read_text())


def local_refs_resolve(schema):
    """Fail closed, including refs in unselected definitions; no network fallback."""
    def visit(node):
        if isinstance(node, dict):
            if '$ref' in node:
                ref = node['$ref']
                if not ref.startswith('#/'):
                    raise ValueError('unresolved reference: ' + ref)
                target = schema
                try:
                    for part in ref[2:].split('/'):
                        target = target[part.replace('~1', '/').replace('~0', '~')]
                except (KeyError, TypeError) as exc:
                    raise ValueError('unresolved reference: ' + ref) from exc
            for value in node.values():
                visit(value)
        elif isinstance(node, list):
            for value in node:
                visit(value)
    visit(schema)
    Draft202012Validator.check_schema(schema)


def pattern_failures(value, schema, root):
    """Full match is additional to schema validation, never Python $ matching."""
    if '$ref' in schema:
        target = root
        for part in schema['$ref'][2:].split('/'):
            target = target[part]
        return pattern_failures(value, target, root)
    if isinstance(value, str):
        if 'pattern' in schema and re.fullmatch(schema['pattern'], value) is None:
            return True
    if isinstance(value, dict):
        return any(pattern_failures(v, schema.get('properties', {}).get(k, {}), root)
                   for k, v in value.items())
    if isinstance(value, list):
        return any(pattern_failures(v, schema.get('items', {}), root) for v in value)
    if 'anyOf' in schema:
        selected = [s for s in schema['anyOf'] if Draft202012Validator(s).is_valid(value)]
        return bool(selected) and all(pattern_failures(value, s, root) for s in selected)
    return False


def contract(c):
    return next(f for f in load('card2_event_contracts.json')['families']
                if f['event_type'] == c['event']['event_type'])


def expected_key(e):
    p = e['payload']
    # Exact declared operation component precedes hex encoding (CV-366).
    operation = e['event_type'] + ':' + p['owner_operation_id']
    return ('application@1:' if e['scope_kind'] == 'application' else 'card2@1:') + \
        p['server_id'].encode().hex() + ':' + operation.encode().hex()


def partition(e):
    return 'app' if e['scope_kind'] == 'application' else 'project~' + \
        base64.urlsafe_b64encode(e['project_id'].encode()).decode().rstrip('=')


@lru_cache(maxsize=None)
def payload_validator(event_type):
    s = load('card2_event_payloads.schema.json')['$defs'][event_type.replace('.', '_')]
    return Draft202012Validator(s, format_checker=FormatChecker())


@lru_cache(maxsize=None)
def event_validator():
    return Draft202012Validator(load('event_record.schema.json'), format_checker=FormatChecker())


@lru_cache(maxsize=None)
def token_validator():
    s = copy.deepcopy(load('event_record_index_checkpoint.schema.json')['$defs']['read_token'])
    s['required'].remove('redb_snapshot_id'); del s['properties']['redb_snapshot_id']
    return Draft202012Validator(s, format_checker=FormatChecker())


def schema_guard(c):
    e = c['event']; f = contract(c); s = load('card2_event_payloads.schema.json')
    selected = s['$defs'][e['event_type'].replace('.', '_')]
    return (not event_validator().is_valid(e)
            or not payload_validator(e['event_type']).is_valid(e['payload'])
            or pattern_failures(e['payload'], selected, s)
            or any(not 0 <= e['payload'][k] <= 2**64-1 for k in ['revision_before', 'revision_after'])
            or len(json.dumps(e['payload'], separators=(',', ':'), ensure_ascii=False).encode()) > 16384
            or e['payload_ref'] is not None)


def scope_guard(c):
    e = c['event']; p = e['payload']; f = contract(c)
    wanted = f['payload_schema_id'] if e['scope_kind'] == 'project' else f['application_payload_schema_id']
    return (any(e[k] != p[k] for k in ['scope_kind', 'project_id', 'thread_id'])
            or e['payload_schema_id'] != p['schema_id'] or p['schema_id'] != wanted
            or c['scope_partition'] != partition(e)
            or (e['scope_kind'] == 'application' and p['thread_id'] is None
                and e['event_type'] == 'memory.gist_state_changed')
            or (e['run_id'] is None) != (e['attempt_id'] is None))


def source_guard(c):
    e = c['event']; p = e['payload']; o = c['owner']
    memory_command = {'verify': 'cmd.chat.memory.verify', 'edit': 'cmd.chat.memory.edit',
                      'pin': 'cmd.chat.memory.pin', 'unpin': 'cmd.chat.memory.pin',
                      'discard': 'cmd.chat.memory.discard'}
    command_mismatch = False
    if e['event_type'] == 'memory.gist_state_changed':
        command_mismatch = (not c['command'].startswith('RealMemoryProvider.')) if p['operation'] == 'automatic' \
            else c['command'] != memory_command[p['operation']]
    return (command_mismatch or not o['authentic'] or not o['committed'] or not o['stop_generation_current']
            or o['subject_id'] != p.get('gist_id', p.get('browser_session_id'))
            or any(o[k] != p[k] for k in ['storage_instance_id', 'server_id', 'computer_id', 'thread_id', 'project_id'])
            or o['operation_id'] != p['owner_operation_id'] or o['change_id'] != p['owner_change_id']
            or o['before_revision'] != p['revision_before'] or o['after_revision'] != p['revision_after']
            or c['command'] not in contract(c)['commands']
            or ('workspace_id' in p and o['workspace_id'] != p['workspace_id']))


def transition_guard(c):
    e = c['event']; p = e['payload']; o = c['owner']; name = e['event_type']
    if p['revision_after'] != p['revision_before'] + 1 or not o['real_change']:
        return True
    if name == 'memory.gist_state_changed' and p['verification_state'] == 'Verified' and p['previous_verification_state'] != 'Verified':
        if not o['manual_override'] and (not p['evidence_refs'] or not o['claim_support_current']):
            return True
    if name == 'browser.session.created':
        return p['revision_before'] != 0 or p['before_record_ref'] is not None or \
            p['previous_lifecycle_state'] is not None or p['lifecycle_state'] != 'open' or \
            p['previous_session_class'] is not None or p['previous_takeover_state'] is not None or \
            p['changed_fields'] != ['created']
    if name == 'memory.gist_state_changed' and p['revision_before'] == 0:
        return p['operation'] != 'automatic' or p['previous_verification_state'] is not None or p['before_record_ref'] is not None
    if p['revision_before'] == 0 or p['before_record_ref'] is None:
        return True
    if name == 'browser.session.closed':
        return p['previous_lifecycle_state'] != 'open' or p['lifecycle_state'] != 'closed' or \
            'lifecycle_state' not in p['changed_fields']
    if name == 'browser.session.promoted':
        return p['previous_session_class'] == 'normal_browsing' or p['session_class'] != 'normal_browsing' or \
            'session_class' not in p['changed_fields']
    if name == 'browser.session.takeover_state_changed':
        return p['previous_takeover_state'] == p['takeover_state'] or 'takeover_state' not in p['changed_fields']
    if name == 'memory.gist_state_changed':
        op = p['operation']
        if op == 'verify':
            return not o['verification_succeeded'] or o['verification_request_only'] or \
                p['verification_state'] != 'Verified' or \
                (not o['manual_override'] and (not p['evidence_refs'] or not o['claim_support_current']))
        if op == 'pin':
            return p['previous_pinned'] or not p['pinned'] or 'pinned' not in p['changed_fields']
        if op == 'unpin':
            return not p['previous_pinned'] or p['pinned'] or 'pinned' not in p['changed_fields']
        if op == 'discard':
            return p['previous_verification_state'] == 'Discarded' or p['verification_state'] != 'Discarded' or 'verification_state' not in p['changed_fields']
    return False


def double_record_guard(c):
    e = c['event']; p = e['payload']
    return any(other['owner_operation_id'] == p['owner_operation_id'] and
               other['change_id'] == p['owner_change_id'] and
               (other['event_type'].startswith(('browser.workspace.', 'browser.controller_lease.'))
                if e['event_type'].startswith('browser.session.') else
                other['event_type'].startswith('memory.gist.')) for other in c['other_events'])


def replay_guard(c):
    return c['event']['replay_policy'] != contract(c)['replay_policy']


def identity_guard(c):
    e = c['event']; p = e['payload']
    event_id = 'card2:' + ':'.join(v.encode().hex() for v in
        [p['storage_instance_id'], p['server_id'], p['owner_operation_id'], e['event_type']])
    return e['idempotency_key'] != expected_key(e) or e['event_id'] != event_id


def receipt_guard(c):
    return c['publication']['terminal_published'] and not c['publication']['append_receipt_issued']


def retry_guard(c):
    e = c['event']; r = c['retry']; original = r['original_event']
    same = all(e[k] == original[k] for k in SEMANTIC_FIELDS)
    return (not r['dedupe_available'] and (r['effects'] != 0 or r['result'] != 'dedupe_unavailable')) or \
        (r['dedupe_available'] and (r['effects'] != 0 or r['result'] != ('original' if same else 'idempotency_conflict')))


def token_schema_guard(c):
    validator = token_validator(); s = validator.schema
    return any(not validator.is_valid(c['reader'][k])
               or pattern_failures(c['reader'][k], s, s)
               for k in ['index_read_token', 'current_index_read_token'])


def token_join_guard(c):
    e = c['event']; r = c['reader']; t = r['index_read_token']
    return (t != r['current_index_read_token'] or r['snapshot_id'] != r['current_snapshot_id']
            or t['storage_instance_id'] != e['payload']['storage_instance_id']
            or t['source_selection']['storage_instance_id'] != t['storage_instance_id']
            or t['checkpoint_key'] != 'event_record_index_checkpoint.v1:' + t['storage_instance_id']
            or t['checkpoint_ref'] != t['checkpoint_key'] + '#/generations/' + t['generation_id']
            or t['index_dataset_name'] != 'event_record_index.v2@' + t['generation_id']
            or r['scope_partition'] != c['scope_partition']
            or any(r[k] != e[k] for k in ['event_id', 'event_type', 'sequence_id']))


def historical_guard(c):
    r = c['reader']
    return not r['authentic_historical_source'] or r['withdrawn']


def access_guard(c):
    r = c['reader']
    return not r['access_allowed'] or r['deleted_content_requested']


def effect_guard(c):
    r = c['reader']
    return r['side_effects'] != [] or r['family_checkpoint'] != r['prior_family_checkpoint']


GUARDS = {'schema': schema_guard, 'scope': scope_guard, 'source': source_guard,
          'transition': transition_guard, 'double_record': double_record_guard,
          'replay_only': replay_guard, 'identity': identity_guard, 'first_receipt': receipt_guard,
          'retry': retry_guard, 'token_schema': token_schema_guard, 'token_join': token_join_guard,
          'historical': historical_guard, 'access': access_guard, 'reader_effect': effect_guard,
          'command_only': lambda c: c['event_count'] != 0 or not c['command_result_retained']}


def failures(c, disabled=None):
    names = ['command_only'] if 'event' not in c else [name for name in GUARDS if name != 'command_only']
    return [name for name in names if name != disabled and GUARDS[name](c)]


def mutate(base, changes):
    c = copy.deepcopy(base)
    for pointer, value in changes:
        parts = pointer.strip('/').split('/'); target = c
        for part in parts[:-1]:
            target = target[int(part)] if isinstance(target, list) else target[part]
        if isinstance(target, list):
            target[int(parts[-1])] = copy.deepcopy(value)
        else:
            target[parts[-1]] = copy.deepcopy(value)
    return c


def run(fixtures=None):
    for name in ['card2_event_payloads.schema.json', 'event_record.schema.json', 'event_record_index_checkpoint.schema.json']:
        local_refs_resolve(load(name))
    fixtures = fixtures or load('card2_event_fixtures.json'); bases = {c['id']: c for c in fixtures['positives']}
    bases.update({c['id']: c for c in fixtures['no_event_cases']})
    errors = []
    for c in bases.values():
        f = failures(c)
        if f: errors.append({'case': c['id'], 'unexpected_failures': f})
    negatives = []
    all_negatives = list(fixtures['negative_cases'])
    for c in fixtures['no_event_cases']:
        for field, value in [('event_count', 1), ('command_result_retained', False)]:
            all_negatives.append({'id': c['id'] + '/' + field, 'base': c['id'],
                                  'guard': 'command_only', 'changes': [('/' + field, value)]})
    for case in all_negatives:
        c = mutate(bases[case['base']], case['changes']); f = failures(c)
        if f != [case['guard']]:
            errors.append({'case': case['id'], 'expected_single_guard': case['guard'], 'actual': f})
        negatives.append((case, c))
    table = []
    for guard in GUARDS:
        own = [case['id'] for case, c in negatives if case['guard'] == guard]
        if not own: errors.append({'guard': guard, 'error': 'no own negative'})
        flipped, stayed = [], []
        for case, c in negatives:
            f = failures(c, disabled=guard)
            if case['guard'] == guard and f == []: flipped.append(case['id'])
            elif case['guard'] != guard and f == [case['guard']]: stayed.append(case['id'])
            else: errors.append({'removed': guard, 'case': case['id'], 'unexpected': f})
        table.append({'guard': guard, 'negatives_that_flip': flipped, 'other_negatives_stay_rejected': len(stayed),
                      'negatives_that_stay_rejected': stayed, 'restored': True})
    # The suite must not silently forget one of its required families or scopes.
    for f in load('card2_event_contracts.json')['families']:
        for scope in ['project', 'application']:
            if not any('event' in c and c['event']['event_type'] == f['event_type'] and c['event']['scope_kind'] == scope for c in bases.values()):
                errors.append({'missing_positive': [f['event_type'], scope]})
    return {'status': 'FAIL' if errors else 'PASS', 'native_execution': 'NOT_RUN',
            'admission': 'ABSENT', 'positives': len(bases), 'negatives': len(negatives),
            'guard_removal_table': table, 'errors': errors}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(); parser.add_argument('--output', type=Path); parser.add_argument('--fixtures', type=Path); args = parser.parse_args()
    try:
        result = run(json.loads(args.fixtures.read_text()) if args.fixtures else None)
    except Exception as exc:
        result = {'status': 'FAIL', 'errors': [str(exc)]}
    if args.output: args.output.write_text(json.dumps(result, indent=2) + '\n')
    print(json.dumps({k:v for k,v in result.items() if k != 'guard_removal_table'}, indent=2))
    raise SystemExit(0 if result['status'] == 'PASS' else 1)
