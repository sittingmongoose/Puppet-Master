"""One saved final-stage control-plane diagnosis; no candidate/body selection."""
import collections,datetime,hashlib,importlib.util,json
from pathlib import Path
HERE=Path(__file__).resolve().parent;LAB=HERE.parents[4]
def sha(path):return hashlib.sha256(Path(path).read_bytes()).hexdigest()
def ref(path,selector=None):
    result={'path':str(path),'sha256':sha(path)}
    if selector:result['selector']=selector
    return result
def pinned(value):
    path=Path(value['path'])
    if sha(path)!=value['sha256']:raise ValueError('Saved control pin mismatch')
    return path
def write(name,value):
    with (HERE/name).open('x') as file:file.write(json.dumps(value,indent=2)+'\n')
def main():
    request_path=LAB/'ops/dispatcher/FINAL_DELIVERY_TRIAGE_REQUEST_001.json';request=json.loads(request_path.read_text())
    for key in ['stage_ref','native_receipt','freeze_ref','runtime_marker','selected_owner_registration']:pinned(request[key])
    stage_path=Path(request['stage_ref']['path']);stage=json.loads(stage_path.read_text());root=stage_path.parent;native=root/'native'
    receipt=json.loads((native/'receipt.json').read_text());freeze=json.loads(Path(request['freeze_ref']['path']).read_text())
    selected=stage['glm_resource'];builder=pinned(selected['tools_config_builder']);profile_path=pinned(selected['bundle_profile']);profile=json.loads(profile_path.read_text())
    source_pin_path=pinned(request['resource_definition']['source_pin']);source_pin=json.loads(source_pin_path.read_text())
    for path,digest in selected['source_pins'].items():pinned({'path':path,'sha256':digest})
    config=json.loads((root/'RESOURCE_TOOLS_CONFIG.json').read_text());native_config=json.loads((native/'ACTUAL_NATIVE_MCP_CONFIG.json').read_text())
    assert config['native_bundle_enabled'] is True and config['bundle_profile_sha256']==selected['bundle_profile']['sha256']
    assert profile['stage_id']==stage['job_id'] and profile['arm_id']==stage['arm']
    tool_counts=collections.Counter();tool_events=[];methods=collections.Counter();host=[];model=[];computer=collections.Counter();mcp=[];turn=[];goal_actions=[];parse_errors=0
    wire_path=native/'protocol.redacted.jsonl'
    with wire_path.open() as file:
        for line_number,line in enumerate(file,1):
            e=json.loads(line);parse_errors+=int(e.get('parse_error') is True);m=e.get('message') or {};method=m.get('method');p=m.get('params') or {}
            if method:methods[(e.get('direction'),method)]+=1
            if e.get('direction')=='in' and method and 'id' in m:host.append({'line_number_1based':line_number,'method':method,'host_utc':e.get('at')})
            if e.get('direction')=='out' and method=='session/goal':goal_actions.append({'line_number_1based':line_number,'action':p.get('action'),'host_utc':e.get('at')})
            if method=='process/mcpTelemetry':mcp.append({'line_number_1based':line_number,'host_utc':e.get('at'),**{k:p.get(k) for k in ['kind','configuredCount','connectedCount','failedCount','processCount','sessionId','orphanSuspected','unownedSeconds']}})
            if method=='computer-use/operation-event':computer[(p.get('kind'),p.get('toolName'))]+=1
            if method!='v4/telemetry/event':continue
            if p.get('kind')=='tool.lifecycle':
                tool_counts[(p.get('toolName'),p.get('phase'))]+=1;tool_events.append({'line_number_1based':line_number,'host_utc':e.get('at'),**{k:p.get(k) for k in ['toolName','phase','toolCallId','durationMs']}})
            if p.get('kind')=='model.request.status':model.append({'line_number_1based':line_number,'host_utc':e.get('at'),**{k:p.get(k) for k in ['requestId','status','durationMs','attempt','maxAttempts','retryable','querySource']}})
            if p.get('kind')=='turn.terminal':turn.append({'line_number_1based':line_number,'host_utc':e.get('at'),**{k:p.get(k) for k in ['status','resultType','durationMs','toolCallCount','errorCode']}})
    operation_path=Path(request['operation_receipts_locator']);ops=[]
    with operation_path.open() as file:
        for line_number,line in enumerate(file,1):
            r=json.loads(line)
            # URL, result text, source content and text_utf8 are never selected.
            ops.append({'line_number_1based':line_number,**{k:r.get(k) for k in ['utc','operation_id','tool','stage','is_error','elapsed_seconds','argument_sha256']}})
    op_counts=collections.Counter((r['tool'],r['stage'],r['is_error']) for r in ops)
    writers=[r for r in tool_events if r['toolName']=='mcp__pm_boundary__write_file'];writer_ops=[r for r in ops if r['tool']=='write_file']
    actor_root=profile_path.parent.parent;addendum_path=actor_root/'TRANSPORT_ADDENDUM.json';addendum=json.loads(addendum_path.read_text());suffix=addendum['suffix_utf8'].encode('utf-8')
    task=Path(stage['prompt_file']);assert sha(task)==stage['prompt_sha256']
    with task.open('rb') as f:f.seek(-len(suffix),2);suffix_matches=f.read()==suffix
    assert suffix_matches and addendum['stage_id']==stage['job_id']
    export_path=LAB/'dev/execution/status-projection/export.py';spec=importlib.util.spec_from_file_location('final_delivery_saved_status',export_path);export=importlib.util.module_from_spec(spec);spec.loader.exec_module(export)
    status=export.project({'job_id':stage['job_id'],'pair_id':stage['pair_id'],'arm':stage['arm'],'stage':stage['stage'],'status':'FAILED'},native/'receipt.json')
    activation_path=native/'activation.json';activation=json.loads(activation_path.read_text());target=activation.get('snapshot',{}).get('session',{}).get('target') or {}
    assert activation.get('startedTurn') is True and target.get('targetId')==receipt['goal_target_id'] and target.get('status')=='active'
    release_path=root/'PRIVATE_SLICE_RELEASE.json';release=json.loads(release_path.read_text());binding_path=root/'RESOURCE_BINDING.json';binding=json.loads(binding_path.read_text())
    model_counts=collections.Counter(r['status'] for r in model)
    result={'schema':'er9.final-delivery-control-diagnosis.v1','created_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'job_id':stage['job_id'],'request':ref(request_path),
        'classification':'BOUNDED_CLOCK_EXHAUSTION_WITH_NO_OBSERVED_WRITER_DISPATCH','engineering_delivery_fault_proven':False,
        'negative_evidence_definition':'Zero configured writer scheduled/started/completed telemetry and zero server-side write_file operation-start/prepared/flushed receipts in the complete saved control surfaces. Not a claim about model intent, partial arguments or unseen model-visible advertisement.',
        'native_writer_event_count':len(writers),'writer_server_receipt_count':len(writer_ops),'writer_events':writers,'writer_receipts':writer_ops,'parse_error_count':parse_errors,
        'tool_lifecycle_counts':[{'tool':t,'phase':p,'count':n} for (t,p),n in tool_counts.items()],
        'source_operation_counts':[{'tool':t,'stage':s,'is_error':e,'count':n} for (t,s,e),n in op_counts.items()],
        'observed_source_dispatch_count':sum(r['stage']=='operation-started' for r in ops),'observed_source_success_count':sum(r['stage']=='stdout-flushed' and r['is_error'] is False for r in ops),
        'observed_source_error_count':sum(r['stage']=='stdout-flushed' and r['is_error'] is True for r in ops),'single_read_error_cause':'UNKNOWN; error boolean exposed, error message/body deliberately not read',
        'operation_evidence':ref(operation_path),'native_control_evidence':ref(wire_path),'source_operation_safe_metadata':ops,'tool_lifecycle_safe_metadata':tool_events,
        'native_computer_control_counts':[{'kind':k,'tool':t,'count':n} for (k,t),n in computer.items()],
        'mcp_control_metadata':mcp,'host_requests':host,'no_observed_permission_request_or_denial':all(r['method']=='session/requestRuntimePreferences' for r in host),
        'permission_definition':'Only saved host-request and control telemetry surfaces checked; no claim about unexposed model-side invalid requests.',
        'model_control_counts':dict(model_counts),'model_control_tail':model[-4:],'attempts_greater_than_one_observed':sum(type(r['attempt']) is int and r['attempt']>1 for r in model),
        'turn_terminal_metadata':turn,'goal_actions':goal_actions,'clock':{'allocation_seconds':receipt['max_seconds'],'response_cap':receipt['max_responses'],'responses_at_router_stop':receipt['native_responses'],
            'original_birth_monotonic_ns':binding['original_birth_monotonic_ns'],'original_total_stop_monotonic_ns':binding['original_total_stop_monotonic_ns'],'native_work_stop_monotonic_ns':binding['native_stop_monotonic_ns'],
            'component_stop_monotonic_ns':binding['guard_stop_monotonic_ns'],'native_elapsed_seconds':receipt['elapsed_seconds'],'outer_freeze_elapsed_seconds':freeze['elapsed_seconds'],
            'definition':'Original600-second allocation counts setup/cleanup; inherited native work stop totalminus30. 575.502 includes cleanup, not a shortened grant/new response limit.'},
        'router_terminal_status':receipt['status'],'direct_native_goal':status,'positive_activation':{'source':ref(activation_path),'startedTurn':activation['startedTurn'],'status':target['status'],'targetId':target['targetId'],'sessionId':target['sessionId']},
        'model_binding':{'source':ref(native/'receipt.json'),'observed_model':receipt['observed_model'],'observed_effort':receipt['observed_effort']},
        'actual_tool_config':{'source':ref(root/'RESOURCE_TOOLS_CONFIG.json'),'builder':ref(builder),'native_config_source':ref(native/'ACTUAL_NATIVE_MCP_CONFIG.json'),'native_bundle_enabled':config['native_bundle_enabled'],
            'bundle_profile_sha256':config['bundle_profile_sha256'],'native_allowlist':native_config['tool_allowlist'],'writer_configured_and_allowed':'mcp__pm_boundary__write_file' in native_config['tool_allowlist'],
            'model_visible_writer_schema':'UNEXPOSED_IN_SELECTED_METADATA; model I/O not inspected'},
        'profile_control_binding':{'source':ref(profile_path),'stage_id':profile['stage_id'],'arm_id':profile['arm_id'],'final_role_enabled':profile['final_role_enabled'],'stage_role':profile['stage_role'],
            'bundle_path':profile['bundle_path'],'canonical_final_paths':profile['allowed_outputs'],'registered_source_pin':ref(source_pin_path)},
        'neutral_transport_binding':{'source':ref(addendum_path),'actual_task_source':ref(task),'suffix_byte_count':len(suffix),'suffix_sha256':hashlib.sha256(suffix).hexdigest(),'actual_task_ends_with_exact_suffix':suffix_matches,
            'stage_id_matches':addendum['stage_id']==stage['job_id'],'suffix_scope':'Common transport-only schema/path/adoption/inventory directives; scientific prefix never decoded or selected.'},
        'required_artifact_outcome':{'source':ref(Path(request['freeze_ref']['path'])),'missing':freeze['missing_required_artifacts'],'invalid_json':freeze['invalid_json_artifacts'],'operational_complete':freeze['operational_complete']},
        'cleanup':{'source':ref(native/'receipt.json'),'native_quiet':freeze['native_quiescent'],'resource_oom':receipt['resource_oom_observed'],'components_quiet':receipt['resource_components_quiet'],
            'parent_release_source':ref(release_path),'recursive_owned_parent_quiet':release['all_private_slice_descendants_quiet']},
        'alias_metadata':{'declared_profile_writer_alias':profile['actor_binding'].get('writer_alias'),'configured_native_G_writer':'mcp__pm_boundary__write_file','source_dispatch_writer':'write_file',
            'actual_used_writer':'UNOBSERVED_NO_WRITER_DISPATCH','source_usage':'bundle_carrier.validate_profile checks stage identity; actor.writer_alias is read only when copying DELIVERY_MANIFEST.native_surface_writer_binding, not for tool dispatch/authorization/argument validation.',
            'causal_delivery_error_established':False,'prospective_action':'Explicitly label logical writer kind and configured native surface in a new metadata version with both-arm closure before a fresh first stage; do not mutate active/frozen profiles or scientific prompt.'},
        'unknowns':['why the model never reached a writer dispatch','unobserved partial/invalid tool request or model-visible writer schema','exact read-error category/body','upstream absolute billing/cancelled tail','semantic adequacy of any model output'],
        'decision':'No speculative code patch, deadline reset, model substitution, host-authored/fallback final4, automatic retry or retroactive completion. Other useful jobs continue under existing admissions.',
        'new_model_goal_or_account_calls':0,'candidate_body_or_text_utf8_payload_selection':0,'runtime_or_live_job_edits':0}
    write('DIAGNOSIS.json',result)
    write('NATIVE_GOAL_STATUS.json',{'schema':'er9.direct-native-goal-status.v1','created_utc':result['created_utc'],'jobs':[status],'scope':'One exact terminal job; source-positive native target status only, separate from failure/completeness.'})
    print(json.dumps({k:result[k] for k in ['classification','native_writer_event_count','writer_server_receipt_count','observed_source_dispatch_count','observed_source_success_count','observed_source_error_count','engineering_delivery_fault_proven']}))
if __name__=='__main__':main()
