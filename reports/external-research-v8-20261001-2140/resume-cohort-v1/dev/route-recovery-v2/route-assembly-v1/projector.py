"""Host-only positive projections. Never hash/copy/emit raw native records."""
import json
import os
from pathlib import Path
import re
import stat

IDENT = re.compile(r'^[A-Za-z0-9_.:-]{1,160}$')
EVENT_FIELDS = {
 'bootstrap.app.startup.started': {'resume': bool, 'hasInjectedModelAdapter': bool},
 'bootstrap.app.startup.plugins.completed': {k:int for k in ('pluginCount','enabledPluginCount','hookCount','commandRootCount','skillRootCount','mcpServerCount')},
 'bootstrap.app.startup.runtime_config.completed': {
  'memoryEnabled':bool,'memoryUse':bool,'memoryExtractionEnabled':bool,
  'runtimeFeatureBrowserUse':bool,'runtimeFeatureNodeRepl':bool,'mcpEnabled':bool,'mode':('build','plan')},
}
STATUSES = {'model_request_started','model_request_completed','model_request_failed','model_retry_scheduled','model_stream_stalled'}

def structural_update(obj, state, expected):
    # Reuses the historical source-defined continuation/fresh-create markers;
    # only positive counters and fixed enums leave the protocol host.
    if isinstance(obj,dict) and obj.get('method')=='v4/telemetry/event':
        value=obj.get('params') or {}
        if value.get('kind')=='hook.lifecycle': state['hook_lifecycle_count']+=1
        if value.get('kind')=='tool.lifecycle':
            name=value.get('toolName'); phase=value.get('phase',value.get('status'))
            state['tool_lifecycle'].append({'tool':name if name in expected else 'UNADMITTED',
                'phase':phase if phase in ('scheduled','started','completed','failed') else 'UNKNOWN',
                'call_id':identity(value.get('toolCallId'))})
    for node in nodes(obj):
        if node.get('source')=='goal-continuation': state['goal_continuation_source_count']+=1
        if node.get('origin')=='goalContinuation': state['goal_continuation_origin_count']+=1
        if node.get('reason')=='goal_continuation_completed': state['goal_continuation_completed_count']+=1
        if node.get('reason')=='goal_continuation_failed': state['goal_continuation_failed_count']+=1
        if node.get('type') in ('hook_run_started','hook_run_completed','hook_run_failed','hookInvocation') or node.get('kind')=='hookInvocation': state['hook_lifecycle_count']+=1
        session=node.get('session')
        if 'messages' in node and isinstance(session,dict) and isinstance(node['messages'],list) and not node['messages']:
            state['fresh_empty_history_samples'].append({'empty_messages':True,'target_absent':not bool(session.get('target')),
                'parent_absent':'parentSessionId' not in session,'session_idle':session.get('status')=='idle'})
        if isinstance(session,dict) and isinstance(session.get('target'),dict):
            target=session['target']
            if target.get('status') in ('active','complete','paused'):
                state['goal_states'].append({'target_id':identity(target.get('targetId')),'status':target['status'],
                    'session_idle':session.get('status')=='idle'})

def structural_empty():
    return {'goal_continuation_source_count':0,'goal_continuation_origin_count':0,
            'goal_continuation_completed_count':0,'goal_continuation_failed_count':0,
            'hook_lifecycle_count':0,'tool_lifecycle':[],'fresh_empty_history_samples':[],'goal_states':[]}

def require(condition):
    if not condition: raise ValueError('positive projection predicate failed')

def identity(value):
    require(type(value) is str and IDENT.fullmatch(value) is not None)
    return value

def nodes(obj):
    if isinstance(obj,dict):
        yield obj
        for value in obj.values(): yield from nodes(value)
    elif isinstance(obj,list):
        for value in obj: yield from nodes(value)

def event_projection(obj):
    all_nodes=list(nodes(obj)); result=[]
    for node in all_nodes:
        event=node.get('event')
        if event not in EVENT_FIELDS: continue
        fields={}
        for key,kind in EVENT_FIELDS[event].items():
            values=[n[key] for n in all_nodes if key in n]
            valid=[v for v in values if type(v) is kind and (kind is not int or 0<=v<=1000000)] if isinstance(kind,type) else [v for v in values if type(v) is str and v in kind]
            if valid and len(valid)==len(values) and all(v==valid[0] for v in valid): fields[key]=valid[0]
        result.append({'event':event,'fields':fields})
    return result

def bounded_rows(path, root, cap=16777216):
    path=Path(path); root=Path(root)
    require(path.is_relative_to(root) and not any(p.is_symlink() for p in (path,*path.parents)))
    fd=os.open(path,os.O_RDONLY|os.O_NOFOLLOW|os.O_NONBLOCK)
    try:
        st=os.fstat(fd)
        require(stat.S_ISREG(st.st_mode) and st.st_nlink==1 and st.st_uid==os.getuid() and st.st_size<=cap)
        with os.fdopen(fd,'rb',closefd=False) as handle:
            count=0
            for line in handle:
                count+=1; require(count<=4096 and len(line)<=4194304 and line.endswith(b'\n'))
                yield json.loads(line)
    finally: os.close(fd)

def startup(private):
    root=Path(private)/'storage/cli/log'
    rows=[]
    # These are only this fresh process's controlled startup logs; no host log,
    # auth/config/history or whole private directory inventory is consulted.
    files=list(root.glob('zcode-????-??-??.jsonl'))
    require(0<len(files)<=2)
    for path in sorted(files):
        for obj in bounded_rows(path,root): rows.extend(event_projection(obj))
    latest={row['event']:row['fields'] for row in rows}
    require(set(latest)==set(EVENT_FIELDS))
    begun=latest['bootstrap.app.startup.started']
    require(begun=={'resume':False,'hasInjectedModelAdapter':False})
    plugins=latest['bootstrap.app.startup.plugins.completed']
    require(plugins=={k:0 for k in EVENT_FIELDS['bootstrap.app.startup.plugins.completed']})
    runtime=latest['bootstrap.app.startup.runtime_config.completed']
    require(set(runtime)==set(EVENT_FIELDS['bootstrap.app.startup.runtime_config.completed']))
    require(all(runtime[k] is False for k in ('memoryEnabled','memoryUse','runtimeFeatureBrowserUse','runtimeFeatureNodeRepl')) and runtime['mcpEnabled'] is True and runtime['mode']=='build')
    return {'verified':True,'allowed_event_rows':[{'event':k,'fields':latest[k]} for k in EVENT_FIELDS],
            'all_memory_off_claim':False,'global_hooks_disabled_claim':False,'raw_file_hash_or_copy':False}

def telemetry(obj):
    if not isinstance(obj,dict) or obj.get('method')!='v4/telemetry/event': return None
    value=obj.get('params')
    if not isinstance(value,dict) or value.get('kind')!='model.request.status': return None
    require(value.get('status') in STATUSES and type(value.get('attempt')) is int and 0<=value['attempt']<=1000000)
    return {'requestId':identity(value.get('requestId')),'attempt':value['attempt'],
            'status':value['status'],'sessionId':identity(value.get('sessionId')),
            'providerId':'builtin:zai-coding-plan' if value.get('providerId')=='builtin:zai-coding-plan' else 'MISMATCH',
            'modelId':'GLM-5.3-Flash' if str(value.get('modelId')).lower()=='glm-5.3-flash' else 'MISMATCH'}

def model_row(obj, session_id, expected):
    require(isinstance(obj,dict) and obj.get('type')=='model_io')
    request=obj.get('request'); model=obj.get('model')
    require(isinstance(request,dict) and isinstance(model,dict))
    body=request.get('body'); logical=request.get('messages')
    require(isinstance(body,dict) and isinstance(logical,list) and 0<len(logical)<=2048)
    system=body.get('system')
    require(isinstance(system,(str,list)))
    if isinstance(system,str): system=[{'type':'text','text':system}]
    tools=body.get('tools',[]); require(isinstance(tools,list) and all(isinstance(t,dict) for t in tools))
    names=[t.get('name',t.get('function',{}).get('name')) for t in tools]
    tools_ok=all(n in expected for n in names)
    row={'request_id':identity(obj.get('requestId')),'attempt':obj.get('attempt'),
         'same_session':obj.get('sessionId')==session_id,
         'model_matches':str(body.get('model')).lower()=='glm-5.3-flash',
         'provider_matches':model.get('providerId')=='builtin:zai-coding-plan',
         'max_effort':model.get('variant')=='max',
         'tool_names':names if tools_ok else [],'unexpected_tool_count':sum(n not in expected for n in names),
         'logical_message_count':len(logical),'body_message_array_available':isinstance(body.get('messages'),list),
         'sdk_message_array_available':isinstance(request.get('sdkMessages'),list),
         'body_system_part_count':len(system),'system_text_part_count':0,'logical_text_part_count':0,
         'global_user_instructions_marker_present':False,'agentsMd_marker_present':False,'auto_memory_marker_present':False}
    require(type(row['attempt']) is int and 0<=row['attempt']<=1000000)
    parts=list(system)
    # The source-defined logical messages and body.system are mandatory. Missing
    # body.messages/sdkMessages are recorded and never counted as proof.
    for msg in logical:
        require(isinstance(msg,dict))
        content=msg.get('content')
        if isinstance(content,str): content=[{'type':'text','text':content}]
        require(isinstance(content,list))
        parts.extend(content)
    for number,part in enumerate(parts):
        require(isinstance(part,dict))
        if part.get('type')=='text':
            text=part.get('text'); require(type(text) is str)
            key='system_text_part_count' if number<len(system) else 'logical_text_part_count'
            row[key]+=1
            row['global_user_instructions_marker_present'] |= 'user default instructions):' in text
            row['agentsMd_marker_present'] |= '# agentsMd' in text
            row['auto_memory_marker_present'] |= "(user's auto-memory, persists across conversations):" in text
    row['context_verified']=row['system_text_part_count']>0 and row['logical_text_part_count']>0 and all(row[k] is False for k in ('global_user_instructions_marker_present','agentsMd_marker_present','auto_memory_marker_present'))
    row['source_deliveries']=source_deliveries(logical,expected)
    return row

def source_deliveries(logical,expected):
    """Only actual logical tool-result exposure; public fields, never content."""
    uses={}; results=[]
    for message in logical:
        content=message.get('content')
        if not isinstance(content,list): continue
        for part in content:
            if not isinstance(part,dict): continue
            kind=part.get('type')
            name=part.get('name',part.get('toolName'))
            if kind in ('tool_use','tool-call') and name in expected:
                uses[identity(part.get('id',part.get('toolCallId')))]=name
            if kind not in ('tool_result','tool-result') or part.get('is_error') is True: continue
            call=part.get('tool_use_id',part.get('toolCallId'))
            if call not in uses: continue
            value=part.get('content',(part.get('output') or {}).get('value') if isinstance(part.get('output'),dict) else None)
            if isinstance(value,list) and len(value)==1 and isinstance(value[0],dict) and value[0].get('type')=='text': value=value[0].get('text')
            if isinstance(value,str):
                if len(value.encode('utf8'))>1048576: continue
                try: value=json.loads(value)
                except ValueError: continue
            if not isinstance(value,dict) or re.fullmatch(r'[0-9a-f]{32}',str(value.get('operation_id',''))) is None: continue
            path=value.get('capture_path',value.get('path'))
            if type(path) is not str or re.fullmatch(r'public_captures/[0-9a-f]{64}\.body',path) is None: continue
            item={'tool_call_id':identity(call),'tool_name':uses[call],'operation_id':value['operation_id'],'capture_path':path}
            hashes=('sha256','range_sha256','transmitted_text_sha256')
            integers=('status','bytes','captured_bytes','range_bytes','byte_start','byte_end_exclusive','transmitted_text_utf8_bytes')
            booleans=('body_complete','truncated','complete_source_delivered','additional_source_bytes_remain')
            for key in hashes:
                if type(value.get(key)) is str and re.fullmatch(r'[0-9a-f]{64}',value[key]): item[key]=value[key]
            for key in integers:
                if type(value.get(key)) is int and 0<=value[key]<=1048576: item[key]=value[key]
            for key in booleans:
                if type(value.get(key)) is bool: item[key]=value[key]
            delivery=value.get('delivery')
            if isinstance(delivery,dict):
                item['delivery']={}
                for key in hashes:
                    if type(delivery.get(key)) is str and re.fullmatch(r'[0-9a-f]{64}',delivery[key]): item['delivery'][key]=delivery[key]
                for key in integers:
                    if type(delivery.get(key)) is int and 0<=delivery[key]<=1048576: item['delivery'][key]=delivery[key]
                for key in booleans:
                    if type(delivery.get(key)) is bool: item['delivery'][key]=delivery[key]
            results.append(item)
    return results

def inventory(private, session_id, expected, model_events):
    root=Path(private)/'storage/cli/rollout'
    path=root/('model-io-'+identity(session_id)+'.jsonl')
    rows=[model_row(obj,session_id,expected) for obj in bounded_rows(path,root,cap=67108864)]
    keys=[(r['request_id'],r['attempt']) for r in rows]
    attempts={(e['requestId'],e['attempt']) for e in model_events if e['status'] in STATUSES-{'model_retry_scheduled'}}
    ids={e['sessionId'] for e in model_events}
    identity_ok=bool(model_events) and ids=={session_id} and all(e['providerId']=='builtin:zai-coding-plan' and e['modelId']=='GLM-5.3-Flash' for e in model_events)
    verified=bool(rows) and identity_ok and set(keys)==attempts and len(keys)==len(set(keys)) and all(r['same_session'] and r['model_matches'] and r['provider_matches'] and r['max_effort'] and r['context_verified'] and r['unexpected_tool_count']==0 for r in rows)
    return {'rows':rows,'expected':expected,'native_model_status_events':model_events,'verified':verified,
            'missing_request_attempts':[list(x) for x in sorted(attempts-set(keys))],
            'unreported_request_attempts':[list(x) for x in sorted(set(keys)-attempts)],'raw_file_hash_or_copy':False}

def receipt_projection(receipt):
    result={}
    for key in ('goal_started_turn','native_quiescent','own_process_group_absent'):
        if type(receipt.get(key)) is bool: result[key]=receipt[key]
    for key in ('native_responses','usage_requests_with_delta'):
        if type(receipt.get(key)) is int and receipt[key]>=0: result[key]=receipt[key]
    statuses={'active','complete','blocked','paused','budget_limited','usage_limited'}
    result['goal_status_final']=receipt.get('goal_status_final') if receipt.get('goal_status_final') in statuses else 'UNESTABLISHED'
    reasons={'goal_complete','goal_budget_limited','goal_paused','goal_target_absent_idle','goal_active_idle90s','cap_seconds','cap_responses','cap_seconds_whole_assignment'}
    result['stop_reason']=receipt.get('stop_reason') if receipt.get('stop_reason') in reasons else 'UNESTABLISHED'
    result['usage_totals']={k:v for k,v in receipt.get('usage_totals',{}).items() if k in ('inputTokens','outputTokens','reasoningTokens','cacheReadTokens','cacheWriteTokens','totalTokens') and type(v) is int and v>=0}
    result['request_status_counts']={k:v for k,v in receipt.get('request_status_counts',{}).items() if k in STATUSES and type(v) is int and v>=0}
    if type(receipt.get('goal_target_id')) is str and IDENT.fullmatch(receipt['goal_target_id']): result['goal_target_id']=receipt['goal_target_id']
    for key,expected in (('provider_id','builtin:zai-coding-plan'),('model_id','GLM-5.3-Flash'),('effort_effective','max')):
        result[key]=expected if receipt.get(key)==expected else 'UNESTABLISHED'
    result['cleanup_projection']={'native_process_returned':type(receipt.get('native_process_returncode')) is int,
                                  'native_process_group_remaining_count':len(receipt.get('native_process_group_remaining',[])) if isinstance(receipt.get('native_process_group_remaining'),list) else None}
    if 'driver_error' in receipt: result['driver_error_present']=True
    return result
