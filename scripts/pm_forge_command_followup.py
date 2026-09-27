#!/usr/bin/env python3
"""FGI-022 executable joins for runner read producers and preview/apply.

This proves internal contract consistency, never live provider execution.
"""
from __future__ import annotations
import copy
import datetime as dt
import json
from pathlib import Path
from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parents[1]
SCHEMA = ROOT/'Plans/forge_integration_contracts.schema.json'
FIXTURES = ROOT/'Plans/forge_integration_contract_fixtures.json'

def stamp(s): return dt.datetime.fromisoformat(s.replace('Z','+00:00'))
def evaluate(b):
    failures=[]
    def check(code, ok):
        if not ok: failures.append(code)
    kind=b['kind']; q=b['request']; p=b['preview'] if kind=='preview_apply' else b['projection']; now=stamp(b['evaluated_at_utc'])
    check('producer_request',p['request_id']==q['request_id'])
    for key in ('provider','instance_id','account_id','repository_binding_ref','automation_binding_ref','runner_scope','capability_snapshot_ref'):
        check('producer_'+key,p[key]==q[key])
    check('producer_generation',p['automation_binding_generation']==q['expected_automation_binding_generation'])
    authoritative=b['authoritative_automation_binding']
    for key in ('provider','instance_id','account_id','repository_binding_ref','automation_binding_ref','capability_snapshot_ref'):
        check('authoritative_'+key,q[key]==authoritative[key])
    check('authoritative_generation',q['expected_automation_binding_generation']==authoritative['binding_generation'])
    check('authoritative_permission',q['permission']['permission_snapshot_ref']==authoritative['permission_snapshot_ref'])
    check('authoritative_current',authoritative['currentness']=='current')
    check('producer_permission',q['permission']['decision']=='allow' and q['permission']['scope']=='read' and p['permission_snapshot_ref']==q['permission']['permission_snapshot_ref'])
    check('producer_current',q['currentness']['state']=='current' and q['currentness']['binding_generation']>0)
    check('producer_expiry',stamp(p['expires_at_utc'])>now>=stamp(p['produced_at_utc' if kind=='runner_list' else 'issued_at_utc']))
    if kind=='preview_apply':
        r=b['result']; a=b['apply']; t=a['target']
        for key in ('execution_host_ref','expected_host_revision','environment_ref'):
            check('preview_'+key,p[key]==q[key])
        check('preview_target',p['target_binding_sha256']==q['permission']['target_binding_sha256']==a['permission']['target_binding_sha256'])
        check('preview_result',r['request_id']==q['request_id'] and r['outcome']=='ready' and r['preview_ref']==p['preview_ref'] and r['preview_digest']==p['preview_digest'])
        check('preview_ref',t['registration_preview_ref']==p['preview_ref'] and t['registration_preview_digest']==p['preview_digest'])
        check('apply_binding',a['repository_binding_ref']==p['repository_binding_ref'] and a['automation_binding_ref']==p['automation_binding_ref'] and a['expected_automation_binding_generation']==p['automation_binding_generation'])
        check('apply_provider',a['provider']==p['provider'] and a['normalized_host']==p['instance_id'] and a['account_id']==p['account_id'])
        check('apply_host',t['execution_host_ref']==p['execution_host_ref'] and t['expected_host_revision']==p['expected_host_revision'])
        host=b['authoritative_execution_host']
        check('authoritative_host',host['execution_host_ref']==p['execution_host_ref'] and host['host_revision']==p['expected_host_revision'] and host['environment_ref']==p['environment_ref'] and host['state']=='ready')
        check('host_consent_step_up',host['consent_ref']==t['execution_host_consent_ref'] and host['step_up_ref']==t['step_up_ref'])
        check('apply_capability',a['capability_snapshot_ref']==p['capability_snapshot_ref'] and a['requested_capability']=='runner_administration')
        check('apply_authority',a['permission']['decision']=='allow' and a['permission']['scope']=='remote_side_effect' and a['currentness']['state']=='current' and a['currentness']['mutation_safety']=='verified' and bool(a['currentness']['direct_revalidation_ref']) and bool(t['step_up_ref']) and bool(t['execution_host_consent_ref']) and bool(a['confirmation']))
        check('preview_disclosure',bool(p['disclosure_ref']) and p['expected_resource_change']=='register_runner')
    return sorted(set(failures))

def check_all() -> list[dict]:
    schema=json.loads(SCHEMA.read_text()); fixtures=json.loads(FIXTURES.read_text()); findings=[]
    cases=fixtures['packet_contract_bundles']
    for b in cases:
        defs=[('request','runner_registration_preview_request' if b['kind']=='preview_apply' else 'runner_list_request'),('preview','runner_registration_preview_record'),('result','runner_registration_preview_result'),('apply','command_request')] if b['kind']=='preview_apply' else [('request','runner_list_request'),('projection','runner_list_projection')]
        for key,name in defs:
            try: Draft202012Validator({'$schema':schema['$schema'],'$defs':schema['$defs'],'$ref':'#/$defs/'+name}).validate(b[key])
            except Exception as e: findings.append({'case':b['name'],'code':'schema_'+key,'detail':str(e)[:250]})
        actual=evaluate(b)
        if actual!=b['expected_failures']:findings.append({'case':b['name'],'expected':b['expected_failures'],'actual':actual})
    # Cross-record counterexamples stay schema-valid. Each must trigger its named join.
    base={x['kind']:x for x in cases}
    mutations=[
        ('runner_list','projection.automation_binding_ref','automation-binding:other','producer_automation_binding_ref'),
        ('runner_list','projection.automation_binding_generation',6,'producer_generation'),
        ('runner_list','authoritative_automation_binding.binding_generation',6,'authoritative_generation'),
        ('runner_list','projection.expires_at_utc','2026-09-01T12:00:30Z','producer_expiry'),
        ('preview_apply','preview.automation_binding_ref','automation-binding:other','producer_automation_binding_ref'),
        ('preview_apply','preview.expected_host_revision','host-revision:20','preview_expected_host_revision'),
        ('preview_apply','authoritative_execution_host.host_revision','host-revision:20','authoritative_host'),
        ('preview_apply','preview.expires_at_utc','2026-09-01T12:00:30Z','producer_expiry'),
        ('preview_apply','apply.target.registration_preview_digest','b'*64,'preview_ref'),
        ('preview_apply','apply.target.execution_host_ref','execution-host:other','apply_host'),
        ('preview_apply','apply.expected_automation_binding_generation',6,'apply_binding'),
        ('preview_apply','apply.permission.decision','deny','apply_authority'),
    ]
    for kind,path,value,wanted in mutations:
        b=copy.deepcopy(base[kind]); cursor=b
        for key in path.split('.')[:-1]:cursor=cursor[key]
        cursor[path.split('.')[-1]]=value
        actual=evaluate(b)
        if wanted not in actual:findings.append({'case':path,'expected':wanted,'actual':actual})
    return findings

def main():
    findings=check_all()
    print(json.dumps({'ok':not findings,'positive_bundles':2,'negative_joins':12,'findings':findings},indent=2))
    return 0 if not findings else 1
if __name__=='__main__':raise SystemExit(main())
