#!/usr/bin/env python3
"""Read-only DF static payload, scope and retry oracles; no native proof/admission."""
from pathlib import Path
import base64
import copy
import hashlib
from datetime import datetime
import json
from urllib.parse import urljoin
from jsonschema import Draft202012Validator, FormatChecker
from referencing import Registry, Resource
ROOT = Path(__file__).resolve().parents[1]

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

def override_scope_semantic(grant,payload):
    scope,ctx=payload['scope'],payload['execution_context']
    if grant['scope_kind']!=scope['scope_kind'] or grant['project_id']!=scope['project_id']:return False
    if grant['scope_kind']=='project':
        if grant['run_id'] is not None and grant['run_id']!=ctx['run_id']:return False
        if grant['worktree_id'] is not None and grant['worktree_id']!=payload.get('worktree_id'):return False
    else:
        if grant['server_id']!=scope['server_id']:return False
        for k in ('computer_id','thread_id','run_id','host_id','environment_id'):
            if grant[k]!=ctx[k]:return False
        if not any(r['root_id']==ctx['root_id'] and r['root_generation']==ctx['root_generation'] for r in grant['recorded_roots']):return False
    command=grant['normalized_command_identity']
    if command is not None and 'normalized_command_identity' in payload and command!=payload['normalized_command_identity']:return False
    return True

def override_subset(granted,requested):
    if granted['scope_kind']!=requested['scope_kind'] or granted['project_id']!=requested['project_id']:return False
    if granted['scope_kind']=='project':
        return all(requested[k] is None or granted[k]==requested[k] for k in ('run_id','worktree_id','normalized_command_identity'))
    keys=('server_id','computer_id','thread_id','run_id','host_id','environment_id')
    return (all(granted[k]==requested[k] for k in keys)
            and all(root in requested['recorded_roots'] for root in granted['recorded_roots'])
            and (requested['normalized_command_identity'] is None or granted['normalized_command_identity']==requested['normalized_command_identity']))

def semantic(payload):
    s, ctx = payload['scope'], payload['execution_context']
    if s['scope_partition'] != partition(s):
        return False
    if 'project_id' in payload and payload['project_id'] != s['project_id']:
        return False
    if 'run_id' in payload and payload['run_id'] != ctx['run_id']:
        return False
    if s['scope_kind'] == 'project' and 'node_id' in payload and (not payload['node_id'] or not payload['attempt_id']):
        return False
    for name in ('requested_scope', 'authorized_scope'):
        if name in payload and not override_scope_semantic(payload[name],payload): return False
    if 'issued_at' in payload and datetime.fromisoformat(payload['expires_at'].replace('Z','+00:00')) <= datetime.fromisoformat(payload['issued_at'].replace('Z','+00:00')):
        return False
    if 'restore_outcome' in payload:
        outcome = payload['restore_outcome']
        target, before, after = (payload[k] for k in ('target_state_sha256','pre_restore_state_sha256','post_restore_state_sha256'))
        if outcome == 'restored_clean' and target != after: return False
        if outcome in ('restore_failed','restore_refused') and before != after: return False
        if outcome == 'restore_skipped' and not target == before == after: return False
    if 'worktree_id' in payload and 'snapshot_manifest_ref' in payload:
        if not all(payload.get(k) for k in ('worktree_path','branch_name','HEAD_sha')):
            return False
    return True

def main():
    fixture = json.loads((ROOT/'Plans/filesafe_event_contract_fixtures.json').read_text())
    shared = json.loads((ROOT/'Plans/shared_integration_runtime.schema.json').read_text())
    registry = Registry().with_resource(shared['$id'], Resource.from_contents(shared))
    failures, counts = [], {}
    for row in fixture['families']:
        f = row['event_type']
        schema = json.loads((ROOT/('Plans/event_payloads/'+f.replace('.','_')+'_v2.schema.json')).read_text())
        Draft202012Validator.check_schema(schema)
        family_registry = registry.with_resource(urljoin(schema["$id"], shared["$id"]), Resource.from_contents(shared))
        validator = Draft202012Validator(schema, registry=family_registry, format_checker=FormatChecker())
        counts[f] = {'positive':0, 'negative':0, 'identity':0}
        for p in row['positive_payloads']:
            errs = list(validator.iter_errors(p))
            if errs or not semantic(p): failures.append(f+': positive '+str(errs[:1]))
            counts[f]['positive'] += 1
        for case in row['negative_payloads']:
            p = case['payload']
            accepted = not list(validator.iter_errors(p))
            if case['layer'] == 'semantic': accepted = accepted and semantic(p)
            if accepted: failures.append(case['case_id']+': negative accepted')
            counts[f]['negative'] += 1
        for vector in row['identity_vectors']:
            p = row['positive_payloads'][vector['payload_index']]
            if list(identity(f,p)) != vector['expected']: failures.append(f+': identity vector')
            counts[f]['identity'] += 1
        # Retry namespace isolation and original identity stability are separate assertions.
        p = row['positive_payloads'][0]
        if identity(f,copy.deepcopy(p)) != identity(f,p): failures.append(f+': unstable retry')
        if identity(f+'.other',p)[1] == identity(f,p)[1]: failures.append(f+': family collision')
        q=copy.deepcopy(p);q['operation_id']+='2'
        if identity(f,q) == identity(f,p): failures.append(f+': operation collision')
    print(json.dumps({'status':'fail' if failures else 'pass','families':counts,'failures':failures,'native_execution':'NOT_RUN','membership':'ABSENT'},indent=2))
    return bool(failures)
if __name__ == '__main__':
    raise SystemExit(main())
