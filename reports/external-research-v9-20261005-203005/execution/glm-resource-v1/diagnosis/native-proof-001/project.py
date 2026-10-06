"""Historical structural metadata only; no runtime invocation or body export."""
import ast,collections,datetime,hashlib,importlib.util,json
from pathlib import Path

HERE=Path(__file__).resolve().parent;LAB=HERE.parents[4]
STATUS_EXPORTER=LAB/'dev/execution/status-projection/export.py'
spec=importlib.util.spec_from_file_location('saved_goal_status_exporter',STATUS_EXPORTER)
status_exporter=importlib.util.module_from_spec(spec);spec.loader.exec_module(status_exporter)
def sha(path):return hashlib.sha256(Path(path).read_bytes()).hexdigest()
def ref(path,selector=None):
    result={'path':str(path),'sha256':sha(path)}
    if selector is not None:result['selector']=selector
    return result
def pinned(pointer):
    path=Path(pointer['path']);path=path if path.is_absolute() else LAB/path
    if sha(path)!=pointer['sha256']:raise ValueError('Historical source pin mismatch')
    return path
def at(value,pointer):
    for key in pointer.strip('/').split('/'):
        if not isinstance(value,dict) or key not in value:return False,None
        value=value[key]
    return True,value
def utc(milliseconds):
    if type(milliseconds) not in (int,float):return None
    return datetime.datetime.fromtimestamp(milliseconds/1000,datetime.timezone.utc).isoformat()
def null_targets(value):
    return all(at(value,pointer)==(True,None) for pointer in ('/session/target','/projection/target'))
def wire_metadata(path):
    calls={};replies=[];parse_errors=0;unknown_actions=0;set_count=0
    with path.open() as f:
        for line_number,line in enumerate(f,1):
            envelope=json.loads(line);parse_errors+=int(envelope.get('parse_error') is True)
            message=envelope.get('message') or {};identifier=message.get('id');method=message.get('method')
            if envelope.get('direction')=='out' and method and identifier is not None:
                params=message.get('params') or {}
                call={'request_id':identifier,'method':method,'action':params.get('action') if method=='session/goal' else None,
                      'session_id':params.get('sessionId'),'line_number_1based':line_number,'host_utc':envelope.get('at')}
                if method=='session/create':call['title_generation_enabled']=params.get('titleGenerationEnabled')
                calls[identifier]=call
                if method=='session/goal':
                    set_count+=int(call['action']=='set');unknown_actions+=int(call['action'] not in ('set','pause'))
            if envelope.get('direction')!='in' or identifier not in calls or method:continue
            call=calls[identifier];result=message.get('result')
            reply={**call,'reply_line_number_1based':line_number,'reply_host_utc':envelope.get('at'),'has_error':'error' in message}
            if call['method'] in ('session/create','session/read') and isinstance(result,dict):
                reply['null_goal_targets']=null_targets(result);reply['native_session_id']=at(result,'/session/sessionId')[1]
            if call['method']=='session/close':reply['native_closed']=isinstance(result,dict) and result.get('closed') is True
            if call['method']=='v4/conversation/usage' and isinstance(result,dict):
                reply['native_usage']={key:result.get(key) for key in ('sessionId','totalTokens','inputTokens','outputTokens','reasoningTokens','cacheCreationTokens','cacheReadTokens','modelRequestCount','modelErrorCount','inputBaselineBySource')}
            replies.append(reply)
    return {'calls':list(calls.values()),'replies':replies,'goal_set_sent_count':set_count,'parse_errors':parse_errors,'unknown_goal_actions':unknown_actions,
            'source':ref(path),'logging_scope':'Pinned send logs+flushes every non-registry RPC before writing native stdin; complete matched create/read/usage/closed lifecycle required.'}
def zero_start_supported(facts):
    required=['all_source_pins_match','controlled_send_before_stdin','guard_before_goal_set','fresh_native_session_created_with_null_target',
              'pre_guard_read_explicit_null_target','final_native_explicit_null_target','positive_native_close','native_registered_model_requests_zero',
              'native_usage_reply_matches_session','native_pause_did_not_start_turn','source_exception_is_preactivation_guard']
    return all(facts.get(key) is True for key in required) and facts.get('goal_set_sent_count')==0 and facts.get('parse_errors')==0 and facts.get('unknown_goal_actions')==0
def source_sequence(runtime_root):
    driver=runtime_root/'glm_stage.py';support=runtime_root/'native_support.py';code=driver.read_text().splitlines();lines={}
    for i,line in enumerate(code,1):
        if "receipt['resource_placements_before_goal']=profile.preactivation_proof" in line:lines['preactivation_guard']=i
        if "receipt['goal_submitted']=True" in line:lines['goal_submission_write']=i
        if "activation=call('session/goal'" in line and "'action':'set'" in line:lines['goal_set_call']=i
    tree=ast.parse(support.read_text());method=next(n for c in tree.body if isinstance(c,ast.ClassDef) and c.name=='ZCodeProtocol' for n in c.body if isinstance(n,ast.FunctionDef) and n.name=='send')
    flush=[];write=[]
    for n in ast.walk(method):
        if isinstance(n,ast.Call) and isinstance(n.func,ast.Attribute):
            text=ast.unparse(n.func)
            if text=='self.wire.flush':flush.append(n.lineno)
            if text=='self.process.stdin.write':write.append(n.lineno)
    ordering=len(flush)==len(write)==1 and flush[0]<write[0]
    guard_before=lines.get('preactivation_guard',10**9)<lines.get('goal_submission_write',0)<lines.get('goal_set_call',0)
    return {'driver':ref(driver),'driver_lines':lines,'send_implementation':ref(support),'send_before_stdin_lines':{'wire_flush':flush,'native_stdin_write':write},
            'controlled_send_before_stdin':ordering,'guard_before_goal_set':guard_before,'resource_guard':ref(LAB/'dev/luna-route/resource_slice.py'),'stack_trace':'UNEXPOSED; branch reconstructed from pinned control flow, exact error class and full native RPC lifecycle.'}
def project(row,binding):
    receipt_path=pinned(row['native_receipt']);stage_path=pinned(row['stage_ref']);freeze_path=pinned(row['freeze_ref']);pinned(row['runtime_marker'])
    receipt=json.loads(receipt_path.read_text());stage=json.loads(stage_path.read_text());freeze=json.loads(freeze_path.read_text())
    pin_path=pinned(row['resource_definition']['source_pin']);pin=json.loads(pin_path.read_text());runtime_root=Path(pin['worker']['path']).parent
    for path,digest in pin['runtime_source_pins'].items():pinned({'path':path,'sha256':digest})
    assert stage['glm_resource']['source_pins']==pin['runtime_source_pins']
    sequence=source_sequence(runtime_root);wire=wire_metadata(receipt_path.parent/'protocol.redacted.jsonl');sid=receipt.get('session_id')
    final=receipt_path.parent/'final-session.redacted.json';final_value=json.loads(final.read_text());reads=[r for r in wire['replies'] if r['method']=='session/read'];creates=[r for r in wire['replies'] if r['method']=='session/create'];usages=[r for r in wire['replies'] if r['method']=='v4/conversation/usage']
    usage=usages[-1]['native_usage'] if usages else {};closes=[r for r in wire['replies'] if r['method']=='session/close'];pauses=[r for r in wire['replies'] if r['method']=='session/goal' and r['action']=='pause']
    # Positive pause result.startedTurn is projected directly without bodies.
    pause_started=[]
    for line_number,line in enumerate((receipt_path.parent/'protocol.redacted.jsonl').read_text().splitlines(),1):
        env=json.loads(line);msg=env.get('message') or {}
        if env.get('direction')=='in' and any(p['request_id']==msg.get('id') for p in pauses):
            pause_started.append({'line_number_1based':line_number,'startedTurn':(msg.get('result') or {}).get('startedTurn')})
    error=receipt.get('error') or '';guard_error=receipt.get('error_class')=='ValueError' and error=='owned component outside private aggregate'
    if receipt.get('error_class')=='FileNotFoundError':guard_error='/sys/fs/cgroup/' in error and '/memory.max' in error
    facts={'all_source_pins_match':True,**{k:sequence[k] for k in ('controlled_send_before_stdin','guard_before_goal_set')},
        'fresh_native_session_created_with_null_target':isinstance(sid,str) and bool(sid) and bool(creates) and creates[0].get('native_session_id')==sid and creates[0].get('null_goal_targets') is True and creates[0].get('title_generation_enabled') is False,
        'pre_guard_read_explicit_null_target':bool(reads) and reads[0].get('native_session_id')==sid and reads[0].get('session_id')==sid and reads[0].get('null_goal_targets') is True,
        'final_native_explicit_null_target':null_targets(final_value),'positive_native_close':bool(closes) and closes[-1].get('session_id')==sid and closes[-1].get('native_closed') is True,
        'native_registered_model_requests_zero':type(usage.get('modelRequestCount')) is int and usage.get('modelRequestCount')==0 and type(usage.get('totalTokens')) is int and usage.get('totalTokens')==0,
        'native_usage_reply_matches_session':usage.get('sessionId')==sid,'native_pause_did_not_start_turn':bool(pause_started) and all(v['startedTurn'] is False for v in pause_started) and all(p['session_id']==sid for p in pauses),
        'source_exception_is_preactivation_guard':guard_error,'goal_set_sent_count':wire['goal_set_sent_count'],'parse_errors':wire['parse_errors'],'unknown_goal_actions':wire['unknown_goal_actions']}
    zero=zero_start_supported(facts)
    native=status_exporter.project({'job_id':row['job_id'],'pair_id':stage['pair_id'],'arm':stage['arm'],'stage':stage['stage'],'status':row['status']},receipt_path)
    activation_path=receipt_path.parent/'activation.json';activation=None;positive=0
    if activation_path.is_file():
        a=json.loads(activation_path.read_text());target=at(a,'/snapshot/session/target')[1]
        if isinstance(target,dict):
            activation={'source':ref(activation_path),'startedTurn':a.get('startedTurn'),'startedTurn_selector':'/startedTurn',
                'native_goal_target_id':target.get('targetId'),'goal_id_selector':'/snapshot/session/target/targetId','session_id':target.get('sessionId'),
                'status':target.get('status'),'status_selector':'/snapshot/session/target/status','created_at_ms':target.get('createdAt'),'created_at_utc':utc(target.get('createdAt')),
                'created_time_selector':'/snapshot/session/target/createdAt','updated_at_ms':target.get('updatedAt'),'updated_at_utc':utc(target.get('updatedAt')),
                'kind_field':'UNEXPOSED','identity_definition':'Opaque native target returned by session/goal action=set; session ID is separate, no prefix or router-label inference.'}
            positive=int(a.get('startedTurn') is True and target.get('status')=='active' and isinstance(target.get('targetId'),str) and bool(target['targetId']) and target['targetId']!=sid and target.get('targetId')==receipt.get('goal_target_id') and target.get('sessionId')==sid and wire['goal_set_sent_count']==1)
    provider=receipt_path.parent/'provider-usage.redacted.jsonl';provider_rows=[json.loads(line) for line in provider.read_text().splitlines()] if provider.is_file() else []
    allowed=('id','logical_request_id','attempt_index','session_id','turn_id','query_source','provider_id','model_id','variant','status','started_at','first_token_at','completed_at','duration_ms','finish_reason','tool_call_count','input_tokens','output_tokens','reasoning_tokens','cache_creation_input_tokens','cache_read_input_tokens','provider_total_tokens','computed_total_tokens','retry_count','error_type','error_code')
    meter=[{key:v.get(key) for key in allowed} for v in provider_rows]
    target=at(final_value,'/session/target')[1]
    native_counters={k:target.get(k) for k in ('timeUsedSeconds','tokensUsed','tokenBudget','activeRunStartedAtMs','activeRunLastSeenAtMs')} if isinstance(target,dict) else None
    release_path=receipt_path.parent.parent/'PRIVATE_SLICE_RELEASE.json';release=json.loads(release_path.read_text()) if release_path.is_file() else {}
    value={'attempt_id':row['job_id'],'job_id':row['job_id'],'original_011_binding':binding,'original_native_receipt':ref(receipt_path),'session_id':sid,
        'router_terminal_status':receipt.get('status'),'registry_operational_status':row['status'],'source_sequence':sequence,'positive_zero_start_proof':facts if zero else None,
        'native_goal_starts':0 if zero else 1 if positive else None,'native_goal_start_definition':'Controlled stage activation count proven by complete pinned lifecycle and explicit native null-target/usage replies, or positive native session/goal set startedTurn+active matched target; never from operator flag/file absence/router status.',
        'native_goal_status':native['native_goal_status'],'goal_id':native['goal_id'],'native_goal_record_update_utc':native.get('native_goal_record_update_utc'),'native_goal_source':native.get('source_evidence'),
        'unknown_reason':native.get('unknown_reason'),'null_native_target_source':ref(final,'/session/target and /projection/target') if zero else None,
        'activation':activation,'goal_kind_enum':'UNEXPOSED','goal_api_identity':'native session/goal target; activation receipt proves Goal API for positive starts; no separate goalId field exposed',
        'wire_lifecycle':wire,'pause_started_turn':pause_started,'direct_native_ui_usage':{'fields':usage,'source':ref(receipt_path.parent/'protocol.redacted.jsonl'),'reply':usages[-1] if usages else None,
           'scope':'Exact saved v4/conversation/usage response for this session; UI inputBaselineBySource behavior, not whole provider-attempt meter.'},
        'provider_attempt_usage':{'source':ref(provider) if provider.is_file() else None,'export_pin_matches_receipt':provider.is_file() and sha(provider)==receipt.get('provider_usage',{}).get('export_sha256'),
           'exact_session_id_matches':all(v.get('session_id')==sid for v in provider_rows),'logged_attempt_count':len(meter),'statuses':dict(collections.Counter(v.get('status') for v in meter)),
           'query_sources':dict(collections.Counter(v.get('query_source') for v in meter)),'attempts':meter,'scope':'Existing exact-session native model_usage attempt export, including completion verification where present; no raw modelIO/metadata/body, no new DB/API query.',
           'known_provider_total_tokens':sum(v.get('provider_total_tokens') or 0 for v in meter),'known_computed_total_tokens':sum(v.get('computed_total_tokens') or 0 for v in meter),
           'partial_attempt_count':sum(v.get('status')!='completed' or v.get('provider_total_tokens') is None for v in meter),'billing_dollars':'UNKNOWN','unexposed_or_cancelled_tail':'UNKNOWN','cache_definition':'Cache counts copied as provider fields; not added again to total. No inclusive billing claim.'},
        'native_target_counters':{'fields':native_counters,'source':ref(final,'/session/target'),'semantics':'Verbatim native target counters, not provider meter or whole occupied clock; token zero is not proof of zero physical cost.'},
        'whole_clock':{'native_elapsed_seconds':receipt.get('elapsed_seconds'),'outer_freeze_elapsed_seconds':freeze.get('elapsed_seconds'),'max_seconds':receipt.get('max_seconds'),
           'original_birth_monotonic':receipt.get('birth_monotonic'),'birth_epoch':receipt.get('birth_epoch'),'ended_utc':receipt.get('ended_utc'),'native_source':ref(receipt_path,'/elapsed_seconds'),
           'outer_source':ref(freeze_path,'/elapsed_seconds'),'definition':'Measured original admission birth through native cleanup/metadata capture; outer freeze adds artifact freeze work. Not Goal-only time or upstream billing duration; final outer exit latency unexposed.'},
        'platform_memory':{'source':ref(release_path) if release_path.is_file() else None,'private_parent_memory_peak_bytes':release.get('before_kernel',{}).get('memory.peak'),
           'memory_events':release.get('before_kernel',{}).get('memory.events'),'slice_recursive_quiet':release.get('all_private_slice_descendants_quiet'),
           'definition':'Actual cgroup complete owned-job kernel memory before exact private release. CPU/GPU/energy/billing absent and UNKNOWN.'},
        'evidence_files':[ref(stage_path),ref(freeze_path),ref(pin_path)],'candidate_quality':'UNASSESSED_BY_THIS_METADATA_EXPORT','new_model_or_goal_calls':0}
    if zero:value['native_goal_lifecycle']='NOT_STARTED_IN_THIS_CONTROLLED_STAGE; native status enum absent because target explicitly null'
    else:value['native_goal_lifecycle']='CREATED_AND_ACTIVATED' if positive else 'UNKNOWN'
    return value

def main():
    request_path=LAB/'ops/dispatcher/GLM_HISTORICAL_PROOF_REQUEST_001.json';binding_path=LAB/'accounting/native-proof-bindings-001.json'
    request=json.loads(request_path.read_text());bindings=json.loads(binding_path.read_text());byid={v['attempt_id']:v for v in bindings['selected_rows']}
    if len(request['rows'])!=12 or {r['job_id'] for r in request['rows']}!=set(byid):raise ValueError('Exact historical twelve-row selection required')
    for r in request['rows']:
        if r['native_receipt']['sha256']!=byid[r['job_id']]['original_native_receipt_pin']['sha256']:raise ValueError('Accounting011 original receipt binding mismatch')
    rows=[project(r,byid[r['job_id']]) for r in request['rows']]
    result={'schema':'er9.historical-native-goal-proof.v1','created_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'base_accounting_cohort':'accounting/cohort-011','request':ref(request_path),'accounting_bindings':ref(binding_path),
            'scope':'Exact twelve already-terminal stages only; original011/source/active jobs unchanged. No candidate body/source fact, registry totals or score inference.',
            'zero_start_proof_count':sum(v['native_goal_starts']==0 for v in rows),'positive_start_count':sum(v['native_goal_starts']==1 for v in rows),'unknown_start_count':sum(v['native_goal_starts'] is None for v in rows),
            'actual_native_goal_status_counts':dict(collections.Counter(v['native_goal_status'] for v in rows)),'rows':rows,'model_or_goal_calls_for_export':0,'original_records_preserved':True}
    with (HERE/'NATIVE_PROOF.json').open('x') as f:f.write(json.dumps(result,indent=2)+'\n')
    # Existing direct-status ABI permits independent exact join with older cohorts.
    statuses={'schema':'er9.direct-native-goal-status.v1','created_utc':result['created_utc'],'status_source_policy':'Matching direct saved native target.status/targetId/update time only; null target remains UNKNOWN status enum and separate proven0activation.',
              'jobs':[{k:r.get(k) for k in ('job_id','native_goal_status','goal_id','native_goal_record_update_utc','unknown_reason','registry_operational_status','router_terminal_status')} | {'source_evidence':r['native_goal_source'],'native_goal_starts':r['native_goal_starts'],'activation':r['activation'],'session_id':r['session_id']} for r in rows],
              'counts_by_last_direct_native_goal_status':result['actual_native_goal_status_counts'],'additive_companion_only':True}
    with (HERE/'NATIVE_GOAL_STATUS.json').open('x') as f:f.write(json.dumps(statuses,indent=2)+'\n')
    print(json.dumps({k:result[k] for k in ('zero_start_proof_count','positive_start_count','unknown_start_count','actual_native_goal_status_counts')}))
if __name__=='__main__':main()
