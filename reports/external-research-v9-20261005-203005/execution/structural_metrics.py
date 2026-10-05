#!/usr/bin/env python3
"""Read exact native/operation receipts; emit counters without candidate prose."""
import argparse
from collections import Counter,defaultdict
from datetime import datetime
import hashlib
import json
from pathlib import Path

TOKEN_FIELDS=('input_tokens','output_tokens','reasoning_tokens','cache_creation_input_tokens',
              'cache_read_input_tokens','provider_total_tokens','computed_total_tokens')

def rows(path):
    with Path(path).open() as handle:
        for line in handle:
            yield json.loads(line)

def pin(path):
    digest=hashlib.sha256()
    with Path(path).open('rb') as handle:
        for chunk in iter(lambda:handle.read(1024*1024),b''): digest.update(chunk)
    return {'path':str(path),'sha256':digest.hexdigest()}

def summarize(home):
    home=Path(home).resolve(strict=True); native=home/'native'
    receipt=json.loads((native/'receipt.json').read_text())
    epoch=receipt['birth_epoch']
    requests={};tools=defaultdict(Counter);rpc_ids={};reads=[];goals=[];terminals=[]
    telemetry=Counter();deltas=defaultdict(list);input_files=[]
    wire=native/'protocol.redacted.jsonl'
    if wire.exists():
        input_files.append(wire)
        for row in rows(wire):
            msg=row.get('message') or {};method=msg.get('method');params=msg.get('params') or {}
            elapsed=round(datetime.fromisoformat(row['at']).timestamp()-epoch,6) if row.get('at') else None
            if row.get('direction')=='out' and method:
                rpc_ids[str(msg.get('id'))]=method
                if method=='session/goal': goals.append({'elapsed_seconds':elapsed,'action':params.get('action')})
            if row.get('direction')=='in' and msg.get('id') and rpc_ids.get(str(msg['id']))=='session/read':
                snap=msg.get('result') or {};proj=snap.get('projection') or {};runtime=snap.get('runtime') or {}
                target=proj.get('target') or snap.get('session',{}).get('target') or {}
                reads.append({'elapsed_seconds':elapsed,'goal_status':target.get('status'),'projection_status':proj.get('status'),
                              'active_tool_count':len(proj.get('activeToolCalls') or []),
                              'pending_native_requests':len(runtime.get('pendingRequestIds') or [])})
                reads=reads[-8:]
            if method!='v4/telemetry/event': continue
            kind=params.get('kind');telemetry[kind]+=1
            if kind=='model.request.status':
                requests[params.get('requestId')]={'status':params.get('status'),'last_observed_elapsed_seconds':elapsed}
            elif kind=='tool.lifecycle': tools[params.get('toolName')][params.get('phase',params.get('status'))]+=1
            elif kind=='turn.terminal':
                terminals.append({'elapsed_seconds':elapsed,'status':params.get('status'),'duration_ms':params.get('durationMs')})
            elif kind=='usage.delta':
                deltas[params.get('requestId')].append({k:v for k,v in params.items() if isinstance(v,(int,float)) and not isinstance(v,bool)})
    provider=native/'provider-usage.redacted.jsonl';attempts=[]
    if provider.exists(): input_files.append(provider);attempts=list(rows(provider))
    sums={k:sum(r[k] for r in attempts if isinstance(r.get(k),(int,float))) for k in TOKEN_FIELDS}
    missing={k:sum(r.get(k) is None for r in attempts) for k in TOKEN_FIELDS}
    operation_file=home/'operation_receipts/events.jsonl';operations={}
    if operation_file.exists():
        input_files.append(operation_file)
        for r in rows(operation_file):
            # Each operation has started, prepared and flushed events. Counting
            # only prepared-result avoids tripling one operation or error.
            if r.get('stage')=='prepared-result':
                operations[r['operation_id']]={'tool':r.get('tool'),'is_error':r.get('is_error'),
                                               'argument_sha256':r.get('argument_sha256')}
    error_ops=[r for r in operations.values() if r.get('is_error') is True]
    failed_fingerprints=Counter((r['tool'],r['argument_sha256']) for r in error_ops if r.get('argument_sha256'))
    execution_root=home/'operation_receipts/executions';executions=[]
    if execution_root.exists():
        for file in sorted(execution_root.glob('*/result.json')):
            input_files.append(file);r=json.loads(file.read_text())
            executions.append({k:r.get(k) for k in ['execution_id','execution_label','actor','exit_code','elapsed_seconds',
                                                     'cleanup_confirmed','unit_active_state_after_stop']})
    return {
        'schema':'er9.structural-stage-metrics.v1','job_id':receipt.get('job_id'),
        'source_scope':'Exact supplied stage files only; no recursive runtime scan, candidate text, tool arguments or source interpretation emitted',
        'native_terminal':receipt.get('status'),'native_quiescent':receipt.get('cleanup',{}).get('native_quiescent'),
        'native_ui_usage':receipt.get('native_usage'),'native_ui_usage_definition':'Conversation UI usage includes input-baseline behavior. Do not treat as repeated-request inclusive input total.',
        'request_status_counts_post_cleanup':dict(Counter(r['status'] for r in requests.values())),
        'request_statuses_post_cleanup':requests,'native_goal_calls':goals,'last_structural_snapshots':reads,
        'turn_terminal_events':terminals,'telemetry_event_counts':dict(telemetry),
        'tool_lifecycle_counts':{name:dict(c) for name,c in tools.items()},
        'tool_lifecycle_semantics':'Completed means invocation terminal; not necessarily success. Use explicit prepared-result is_error separately.',
        'source_tool_operations':len(operations),'source_tool_error_operations':len(error_ops),
        'source_tool_error_counts':dict(Counter(r['tool'] for r in error_ops)),
        'repeated_error_fingerprints':[{'tool':t,'argument_sha256':h,'error_count':count} for (t,h),count in failed_fingerprints.items() if count>1],
        'invalid_argument_error_count':None,
        'invalid_argument_error_definition':'Unknown: captured structural is_error does not expose an error class; HTTP/source failure and invalid argument are not silently conflated.',
        'execution_operations':executions,'execution_nonzero_exits':sum(r.get('exit_code') not in (0,None) for r in executions),
        'provider_attempt_rows':len(attempts),'provider_attempt_status_counts':dict(Counter(r.get('status') for r in attempts)),
        'provider_query_source_counts':dict(Counter(r.get('query_source') for r in attempts)),
        'provider_attempt_field_sums':sums,'provider_attempt_null_counts':missing,
        'provider_counter_definitions':'Sum each exported field across individual native attempts, including native verifier. Input includes provider-reported cached input; do not add cache-read again. provider_total and computed_total are alternatives, not summands. Tokens are not dollars.',
        'cancelled_usage_unknown':any(r.get('status') not in ('completed',) for r in attempts),
        'cancelled_usage_definition':'Zero-filled cancelled row is not proof of no consumed usage. Provider total null and unexposed partial streaming usage remain unknown.',
        'usage_delta_event_counts_by_request':{r:len(v) for r,v in deltas.items()},
        'usage_delta_semantics':'Raw observed events only. Do not assume repeated events are independent incremental amounts without their native definition.',
        'input_receipts':[pin(p) for p in [native/'receipt.json',*input_files]]
    }

def main():
    p=argparse.ArgumentParser(description=__doc__);p.add_argument('--stage-home',required=True);p.add_argument('--out')
    a=p.parse_args();value=summarize(a.stage_home);output=json.dumps(value,indent=2)+'\n'
    if a.out:
        path=Path(a.out);path.parent.mkdir(parents=True,exist_ok=True)
        with path.open('x') as handle:handle.write(output)
        print(json.dumps({'out':str(path),'sha256':hashlib.sha256(output.encode()).hexdigest()}))
    else: print(output,end='')
if __name__=='__main__':main()
