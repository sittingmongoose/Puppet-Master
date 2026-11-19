#!/usr/bin/env python3
"""Static DL-2450 effective-count checks on all twelve existing owner positives.

This checks a planning binding and bounded count/expiry scenarios. Native
counting, compaction, refusal, cleanup and producer adoption remain NOT_RUN.
"""
import argparse
import copy
from functools import lru_cache
import hashlib
import importlib.util
import json
from pathlib import Path
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT/'scripts'))
import pm_filesafe_event_contracts as owner
from pm_filesafe_retention import expected_policy

FAMILY = 'filesafe.policy_degraded'
BUCKET = 'app:filesafe_policy_degraded'
CAP = 2000000
TTL = 220752000


def scope_count(event, payload, binding):
    if event != FAMILY:
        raise ValueError('family not assigned to this bucket')
    scope = payload['scope']
    server = scope['server_id']
    if scope['scope_kind'] == 'application':
        if payload['project_id'] is not None or scope['scope_partition'] != 'app' or BUCKET not in binding:
            raise ValueError('Application count binding unavailable')
        return server, BUCKET
    if scope['scope_kind'] == 'project' and payload['project_id'] == scope['project_id'] and scope['project_id']:
        return server, owner.partition(scope)
    raise ValueError('invalid scope')


def append_state(states, key):
    """Count summary oracle; only expired unheld members can make room."""
    result = copy.deepcopy(states)
    state = result[key]
    if state['count'] < CAP:
        state['count'] += 1
        return 'append', result
    if state['expired_unheld']:
        state['expired_unheld'] -= 1
        return 'compact_expired_then_append', result
    return 'refused_capacity', result


def owner_errors(texts, policy):
    errors = []
    if policy != expected_policy('RP-OPERATIONAL-2555D'):
        errors.append('base operational policy changed')
    for ref in ('Plans/storage-plan.md#SP-556', 'Plans/Contracts_V0.md#CV-556'):
        body = texts.get(ref, '')
        current = re.search(r'Current selected assignment.*?Its event history selects (.*?);|Current selected assignment.*?Its event history selects (.*?)\. The Application bucket', body, re.S)
        # Both owners use the same explicit current Application/Project summary.
        assignment = next((line for line in body.splitlines() if 'Current selected assignment' in line), '')
        required = ['Application = RP-OPERATIONAL-2555D@1.0.0', 'anchor_kind=terminal_transition',
            'count in '+BUCKET, 'one dedicated bucket per Puppet Master Server under DL-2450',
            'Project = RP-OPERATIONAL-2555D@1.0.0', 'count in the Project partition']
        if any(token not in assignment for token in required):
            errors.append(ref+':effective count assignment')
    decision = texts.get('Plans/Decision_Log.md#DL-2450', '')
    if any(token not in decision for token in [FAMILY, BUCKET, 'E15-1', 'this', 'SP-556',
            'RP-OPERATIONAL-2555D@1.0.0', '220,752,000', '2,000,000', 'terminal-transition',
            'per Puppet Master Server', 'NOT_RUN']):
        errors.append('DL-2450:recorded authority and unchanged limits')
    buckets = texts.get('buckets', '')
    if any(token not in buckets for token in [FAMILY, BUCKET, 'DL-2450', 'per Puppet Master Server',
            '2,000,000', '220,752,000', 'NOT_RUN']):
        errors.append('cross-family Storage bucket binding')
    return errors


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--revision')
    p.add_argument('--output', type=Path)
    p.add_argument('--self-test', action='store_true')
    args = p.parse_args()
    @lru_cache(maxsize=32)
    def read(path):
        return subprocess.check_output(['git','-C',str(ROOT),'show',args.revision+':'+path]).decode() if args.revision else (ROOT/path).read_text()
    spec = importlib.util.spec_from_file_location('filesafe_count_writer', ROOT/'scripts/pm-ea-admission-writer.py')
    w = importlib.util.module_from_spec(spec); spec.loader.exec_module(w)
    def section(path, unit):
        body = read(path)
        span = w.unit_span(body, unit)
        return '\n'.join(body.splitlines()[span[0]-1:span[1]]) if span else ''
    texts = {ref:section(*ref.split('#',1)) for ref in ['Plans/storage-plan.md#SP-556',
        'Plans/Contracts_V0.md#CV-556','Plans/Decision_Log.md#DL-2450']}
    body = read('Plans/storage-plan.md')
    headings = re.findall(r'(?m)^### (Application-wide count buckets under the operational policy[^\n]*)$', body)
    span = w.heading_span(body, headings[0]) if len(headings)==1 else None
    texts['buckets'] = '\n'.join(body.splitlines()[span[0]-1:span[1]]) if span else ''
    policy = next(x for x in json.loads(read('Plans/storage_value_registry.json'))['retention_policies'] if x['policy_id']=='RP-OPERATIONAL-2555D')
    findings = owner_errors(texts, policy)
    family = next(x for x in json.loads(read('Plans/filesafe_event_contract_fixtures.json'))['families'] if x['event_type']==FAMILY)
    validator = owner.payload_validator(FAMILY)
    cases = []
    counts = {'application':0, 'project':0}
    for index, payload in enumerate(family['positive_payloads']):
        errors = owner.payload_failures(FAMILY, payload, 'semantic', validator)
        scope = payload['scope']['scope_kind']; counts[scope] += 1
        identity_before = owner.identity(FAMILY,payload)
        try:
            key = scope_count(FAMILY,payload,texts['Plans/storage-plan.md#SP-556'])
        except ValueError as exc:
            key = None; errors.append(str(exc))
        expected = (payload['scope']['server_id'], BUCKET if scope=='application' else owner.partition(payload['scope']))
        if key != expected or identity_before != owner.identity(FAMILY,payload):
            errors.append('effective count/identity mismatch')
        cases.append(dict(index=index,scope=scope,project_id=payload['project_id'],partition=owner.partition(payload['scope']),
            count_key=key,replay_identity=identity_before,errors=errors))
        findings.extend(f'positive {index}: '+error for error in errors)
    if counts != dict(application=7,project=5):
        findings.append('existing positive coverage changed')
    app = copy.deepcopy(family['positive_payloads'][1])
    other = copy.deepcopy(app); other['scope']['server_id']='srv2'
    binding = texts['Plans/storage-plan.md#SP-556']
    scenarios, mutations = [], []
    if BUCKET in binding:
        key = scope_count(FAMILY,app,binding); independent = scope_count(FAMILY,other,binding)
        if key == independent:
            findings.append('Server caps share a key')
        sentinel = (key[0], 'app:github_sign_in')
        for count,expired,expected in [(CAP-1,0,'append'),(CAP,0,'refused_capacity'),(CAP,1,'compact_expired_then_append')]:
            states={key:dict(count=count,expired_unheld=expired,held=3),
                independent:dict(count=7,expired_unheld=0,held=2),sentinel:dict(count=CAP,expired_unheld=0,held=1)}
            outcome,after=append_state(states,key)
            okay=outcome==expected and after[independent]==states[independent] and after[sentinel]==states[sentinel] and after[key]['held']==states[key]['held'] and after[key]['count']<=CAP
            if expected=='refused_capacity': okay=okay and after==states
            scenarios.append(dict(count=count,expired_unheld=expired,outcome=outcome,okay=okay))
            if not okay:findings.append('capacity/isolation scenario')
        for age,held,eligible in [(TTL-1,False,False),(TTL,False,True),(TTL,True,False)]:
            scenarios.append(dict(age_seconds=age,held=held,expiry_eligible=age>=policy['ttl_seconds'] and not held,
                okay=(age>=policy['ttl_seconds'] and not held)==eligible))
        for event in ['filesafe.command_denied','storage.boot_recovery']:
            try:scope_count(event,app,binding);findings.append('another family entered FileSafe bucket')
            except ValueError:pass
    if args.self_test and not findings:
        for ref in ['Plans/storage-plan.md#SP-556','Plans/Contracts_V0.md#CV-556']:
            changed=dict(texts);changed[ref]=changed[ref].replace('count in '+BUCKET+', one dedicated bucket per Puppet Master Server under DL-2450','cardinality_scope=project')
            killed=bool(owner_errors(changed,policy));mutations.append(dict(ref=ref,mutation='restore Application Project count',killed=killed))
        changed=dict(texts);changed['buckets']=changed['buckets'].replace(BUCKET,'app:github_sign_in')
        mutations.append(dict(mutation='route into another bucket',killed=bool(owner_errors(changed,policy))))
        changed=copy.deepcopy(policy);changed['max_cardinality']+=1
        mutations.append(dict(mutation='change existing cap',killed=bool(owner_errors(texts,changed))))
        findings.extend('mutation survived' for x in mutations if not x['killed'])
    result=dict(schema_id='pm.ea.filesafe_application_count.v1',input_revision=args.revision or 'working_tree',
        native_execution='NOT_RUN',qualification='static owner binding and count-summary oracle',
        source_sha256={ref:hashlib.sha256(value.encode()).hexdigest() for ref,value in texts.items()},
        counts=counts,cases=cases,scenarios=scenarios,mutations=mutations,findings=findings)
    if args.output:args.output.parent.mkdir(parents=True,exist_ok=True);args.output.write_text(json.dumps(result,indent=2)+'\n')
    print(json.dumps(dict(positive_cases=len(cases),counts=counts,findings=len(findings),mutations=len(mutations))))
    return int(bool(findings))


if __name__=='__main__':
    raise SystemExit(main())
