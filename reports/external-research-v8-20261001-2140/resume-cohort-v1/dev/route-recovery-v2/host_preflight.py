"""Metadata admission before any MCP/native child; full PID1 admission follows."""
import hashlib
import json
from pathlib import Path
import time

def record(value):
    if set(value)!={'path','sha256'}: raise ValueError('exact record required')
    p=Path(value['path'])
    if not p.is_absolute() or '..' in p.parts or any(q.is_symlink() for q in (p,*p.parents)) or not p.is_file(): raise ValueError('regular metadata required')
    if hashlib.sha256(p.read_bytes()).hexdigest()!=value['sha256']: raise ValueError('metadata drift')
    return json.loads(p.read_text())

def validate(plan):
    authority=plan['case_authority']
    clock=record({k:authority[k] for k in ('path','sha256')})
    if clock!=authority['clock']: raise ValueError('original authority drift')
    stage=clock['stages'][plan['stage_id']]
    if stage!={'stage_start_monotonic_ns':plan['stage_start_monotonic_ns'],'cap_seconds':plan['cap_seconds'],'response_cap':plan['response_cap']}: raise ValueError('stage clock drift')
    deadline=min(stage['stage_start_monotonic_ns']+stage['cap_seconds']*10**9,clock['case_start_monotonic_ns']+clock['case_elapsed_cap_seconds']*10**9,clock['campaign_native_cutoff_monotonic_ns'])
    if plan['deadline_monotonic_ns']!=deadline or plan['native_stop_monotonic_ns']!=deadline-plan['cleanup_reserve_seconds']*10**9 or time.monotonic_ns()>=plan['native_stop_monotonic_ns']: raise ValueError('original deadline drift')
    if plan['owned_unit']!='er8-'+plan['stage_id']+'.service': raise ValueError('owned unit drift')
    binding=plan['assembly_binding']
    if set(binding)!={'config','lease','case_binding','acceptance'}: raise ValueError('four ABI records required')
    records={key:record(value) for key,value in binding.items()}
    lease,case=records['lease'],records['case_binding']
    if lease.get('case_authority')!=authority or lease.get('owned_unit')!=plan['owned_unit'] or lease.get('deadline_monotonic_ns')!=deadline or lease.get('native_stop_monotonic_ns')!=plan['native_stop_monotonic_ns']: raise ValueError('lease drift')
    expected={'case_id':clock['case_id'],'case_start_monotonic_ns':clock['case_start_monotonic_ns'],'stage_id':plan['stage_id'],'stage_start_monotonic_ns':plan['stage_start_monotonic_ns'],'max_seconds':plan['cap_seconds'],'max_responses':plan['response_cap'],'config_sha256':binding['config']['sha256'],'lease_sha256':binding['lease']['sha256'],'public_get':'--public-get' in plan['runtime_argv'],'mode':'canary' if plan['v8_stage_role']=='lifetime-canary' else 'productive'}
    if any(case.get(k)!=v for k,v in expected.items()): raise ValueError('case clock/config drift')
    for field,flag in [('workspace','--workspace'),('prompt_file','--prompt-file'),('native_out','--out'),('label','--label')]:
        args=plan['runtime_argv']
        if args.count(flag)!=1 or case.get(field)!=args[args.index(flag)+1]: raise ValueError('case exact argument drift')
    if records['config'].get('snapshot_path')!=plan['route_snapshot']['path'] or records['acceptance'].get('snapshot_sha256')!=plan['route_snapshot']['sha256'] or case['mode'] not in records['acceptance'].get('allowed_modes',[]): raise ValueError('selected route scope drift')
    return True
