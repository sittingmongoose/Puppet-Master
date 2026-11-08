#!/usr/bin/env python3
"""Read-only DF static payload, scope and retry oracles; no native proof/admission.

Every refusal is one named row of a Method B guard table (pm_filesafe_tables);
this module derives each phase observation and refuses only through the rows.
"""
from pathlib import Path
import base64
import copy
import hashlib
from datetime import datetime, timedelta, timezone
import json
from jsonschema import Draft202012Validator
import pm_filesafe_schema_graph as schema_graph
import pm_filesafe_tables as tables
ROOT = Path(__file__).resolve().parents[1]
EPOCH = datetime(1970, 1, 1, tzinfo=timezone.utc)
MICROSECOND = timedelta(microseconds=1)


def partition(scope):
    if scope['scope_kind'] == 'application':
        return 'app'
    return 'project~' + base64.urlsafe_b64encode(scope['project_id'].encode()).decode().rstrip('=')


def identity(event_type, payload):
    s = payload['scope']
    key = ('application@1:' + s['server_id'].encode().hex() + ':' if s['scope_kind'] == 'application' else 'filesafe@2:') + payload['operation_id'].encode().hex()
    # All identity vector strings are ASCII; this is also their RFC8785 encoding.
    raw = json.dumps(['df-event-v2', partition(s), event_type, key], ensure_ascii=False, separators=(',', ':')).encode()
    return key, 'evt_df_' + hashlib.sha256(raw).hexdigest()


def instant_us(value):
    """Exact UTC microseconds of an RFC 3339 instant (observation for window rows)."""
    moment = datetime.fromisoformat(value.upper().replace('Z', '+00:00'))
    return (moment - EPOCH) // MICROSECOND


def override_scope_semantic(grant, payload):
    scope, ctx = payload['scope'], payload['execution_context']
    if tables.refused('override_scope_root', {
            'grant_scope_kind': grant['scope_kind'], 'scope_kind': scope['scope_kind'],
            'grant_project_id': grant['project_id'], 'scope_project_id': scope['project_id']}):
        return False
    if grant['scope_kind'] == 'project':
        if tables.refused('override_scope_project', {
                'grant_run_id': grant['run_id'], 'ctx_run_id': ctx['run_id'],
                'grant_worktree_id': grant['worktree_id'], 'payload_worktree_id': payload.get('worktree_id')}):
            return False
    else:
        facts = {'grant_server_id': grant['server_id'], 'scope_server_id': scope['server_id'],
                 'ctx_pair': [ctx['root_id'], ctx['root_generation']],
                 'recorded_pairs': [[r['root_id'], r['root_generation']] for r in grant['recorded_roots']]}
        for k in ('computer_id', 'thread_id', 'run_id', 'host_id', 'environment_id'):
            facts['grant_' + k], facts['ctx_' + k] = grant[k], ctx[k]
        if tables.refused('override_scope_application', facts):
            return False
    return not tables.refused('override_scope_command', {
        'grant_command': grant['normalized_command_identity'],
        'command_present': 'normalized_command_identity' in payload,
        'payload_command': payload.get('normalized_command_identity')})


def override_subset(granted, requested):
    if tables.refused('override_subset_root', {
            'granted_scope_kind': granted['scope_kind'], 'requested_scope_kind': requested['scope_kind'],
            'granted_project_id': granted['project_id'], 'requested_project_id': requested['project_id']}):
        return False
    if granted['scope_kind'] == 'project':
        return not tables.refused('override_subset_project', {
            'granted_run_id': granted['run_id'], 'requested_run_id': requested['run_id'],
            'granted_worktree_id': granted['worktree_id'], 'requested_worktree_id': requested['worktree_id'],
            'granted_command': granted['normalized_command_identity'],
            'requested_command': requested['normalized_command_identity']})
    facts = {}
    for k in ('server_id', 'computer_id', 'thread_id', 'run_id', 'host_id', 'environment_id'):
        facts['granted_' + k], facts['requested_' + k] = granted[k], requested[k]
    if tables.refused('override_subset_application', facts):
        return False
    return not tables.refused('override_subset_scope', {
        'granted_roots': granted['recorded_roots'], 'requested_roots': requested['recorded_roots'],
        'granted_command': granted['normalized_command_identity'],
        'requested_command': requested['normalized_command_identity']})


INLINE_PAYLOAD_LIMIT = 16 * 1024


def payload_bytes(payload):
    """The DF inline budget is the complete canonical UTF-8 JSON body, not chars."""
    return json.dumps(payload, sort_keys=True, ensure_ascii=False,
                      separators=(',', ':'), allow_nan=False).encode('utf-8')


def semantic(payload, *, inline=True):
    if inline and tables.refused('payload_inline', {'inline_bytes': len(payload_bytes(payload))}):
        return False
    s, ctx = payload['scope'], payload['execution_context']
    if tables.refused('payload_scope', {
            'scope_partition': s['scope_partition'], 'expected_partition': partition(s),
            'project_id_present': 'project_id' in payload, 'payload_project_id': payload.get('project_id'),
            'scope_project_id': s['project_id'],
            'run_id_present': 'run_id' in payload, 'payload_run_id': payload.get('run_id'), 'ctx_run_id': ctx['run_id'],
            'scope_kind': s['scope_kind'], 'node_present': 'node_id' in payload,
            'node_id': payload.get('node_id'), 'attempt_id': payload.get('attempt_id')}):
        return False
    for name in ('requested_scope', 'authorized_scope'):
        if name in payload and not override_scope_semantic(payload[name], payload):
            return False
    issued = 'issued_at' in payload
    if tables.refused('payload_grant_window', {
            'issued_present': issued,
            'issued_us': instant_us(payload['issued_at']) if issued else None,
            'expires_us': instant_us(payload['expires_at']) if issued else None}):
        return False
    if 'restore_outcome' in payload and tables.refused('payload_restore', {
            'outcome': payload['restore_outcome'], 'target': payload['target_state_sha256'],
            'before': payload['pre_restore_state_sha256'], 'after': payload['post_restore_state_sha256']}):
        return False
    if 'worktree_id' in payload and 'snapshot_manifest_ref' in payload and tables.refused('payload_worktree', {
            k: payload.get(k) for k in ('worktree_path', 'branch_name', 'HEAD_sha')}):
        return False
    return True


def schema_errors(validator, instance):
    return sum(1 for _ in validator.iter_errors(instance))


def contract_row(family):
    fixture = json.loads((ROOT/'Plans/filesafe_event_contract_fixtures.json').read_text())
    return next(r for r in fixture['families'] if r['event_type'] == family)


def contract_positive(family, index):
    return contract_row(family)['positive_payloads'][index]


def payload_validator(family):
    schema = json.loads((ROOT/('Plans/event_payloads/'+family.replace('.','_')+'_v2.schema.json')).read_text())
    graph, documents, registry = schema_graph.context(family)
    return Draft202012Validator(schema, registry=registry, format_checker=schema_graph.format_checker())


def payload_failures(family, payload, layer, validator=None):
    """The payload CLI boundary: closed schema, then (semantic layer) the semantic oracle."""
    validator = payload_validator(family) if validator is None else validator
    if tables.refused('contract_payload_schema', {'errors': schema_errors(validator, payload)}):
        return ['payload_schema']
    if layer == 'semantic' and not semantic(payload):
        return ['payload_semantics']
    return []


def identity_vector_failures(family, payload, expected):
    return (['identity_vector'] if tables.refused('contract_identity_vector', {
        'computed': list(identity(family, payload)), 'expected': expected}) else [])


def main(families=None):
    fixture = json.loads((ROOT/'Plans/filesafe_event_contract_fixtures.json').read_text())
    failures, counts = schema_graph.format_case_failures(), {}
    order = tables.table_order_errors()
    if order:
        failures.append('shared:table_require_order:' + ','.join(order))
    for row in fixture['families']:
        if families is not None and row['event_type'] not in families: continue
        f = row['event_type']
        schema = json.loads((ROOT/('Plans/event_payloads/'+f.replace('.','_')+'_v2.schema.json')).read_text())
        if schema_graph.schema_document_refused(schema):
            failures.append(f + ':payload_schema_document_invalid')
            continue
        counts[f] = {'positive':0, 'negative':0, 'identity':0}
        graph,documents,registry = schema_graph.context(f)
        ref_errors = schema_graph.reference_failures(graph, documents, registry)
        failures.extend(f + ':' + error for error in ref_errors)
        failures.extend(schema_graph.negative_case_failures(f, graph, documents))
        if ref_errors:
            continue
        validator = Draft202012Validator(schema, registry=registry, format_checker=schema_graph.format_checker())
        for p in row['positive_payloads']:
            schema_refused = tables.refused('contract_payload_schema', {'errors': schema_errors(validator, p)})
            if schema_refused or not semantic(p): failures.append(f+': positive '+str(list(validator.iter_errors(p))[:1]))
            counts[f]['positive'] += 1
        for case in row['negative_payloads']:
            if not payload_failures(f, case['payload'], case['layer'], validator): failures.append(case['case_id']+': negative accepted')
            counts[f]['negative'] += 1
        for vector in row['identity_vectors']:
            if identity_vector_failures(f, row['positive_payloads'][vector['payload_index']], vector['expected']):
                failures.append(f+': identity vector')
            counts[f]['identity'] += 1
        # Retry namespace isolation and original identity stability are separate assertions.
        p = row['positive_payloads'][0]
        q = copy.deepcopy(p); q['operation_id'] += '2'
        for _, code in tables.refusals('contract_identity_selfcheck', {
                'first': list(identity(f, p)), 'retry': list(identity(f, copy.deepcopy(p))),
                'event_id': identity(f, p)[1], 'other_family_event_id': identity(f + '.other', p)[1],
                'other_operation': list(identity(f, q))}):
            failures.append(f + ': ' + code.replace('_', ' '))
    import pm_filesafe_p2a_cases as p2a
    failures.extend(p2a.case_failures(set(families) | {'shared'} if families is not None else None,
                                      boundary=('schema_meta', 'identity_vector', 'payload_semantic')))
    print(json.dumps({'status':'fail' if failures else 'pass','families':counts,'failures':failures,'native_execution':'NOT_RUN','membership':'ABSENT'},indent=2))
    return bool(failures)
if __name__ == '__main__':
    import argparse
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--family')
    args=parser.parse_args()
    raise SystemExit(main((args.family,) if args.family else None))
