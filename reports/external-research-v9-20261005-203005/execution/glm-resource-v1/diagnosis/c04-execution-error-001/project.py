"""One closed C04 control-plane projection; no candidate/science fields."""
from collections import Counter
from datetime import datetime, timezone
import hashlib
import importlib.util
import json
from pathlib import Path

HERE=Path(__file__).resolve().parent
LAB=HERE.parents[4]
JOB='C-04-RESOURCE-R002-BUNDLE-treatment-research-a001'
REQUEST_SHA='3f2790c2e6f44cbb6bb22a7d7a55db38cf44ee2bb2aeeb1d1f65a6a9428b42f8'

def sha(path):return hashlib.sha256(Path(path).read_bytes()).hexdigest()
def ref(path,selector=None):
    result={'path':str(Path(path).absolute()),'sha256':sha(path)}
    if selector is not None:result['selector']=selector
    return result
def utc(epoch):return datetime.fromtimestamp(epoch,timezone.utc).isoformat()
def epoch(value):return datetime.fromisoformat(value).timestamp()
def save(name,value):
    with (HERE/name).open('x') as file:json.dump(value,file,indent=2);file.write('\n')
def projected_target(value,goal_id,session_id):
    state=value.get('snapshot',value);result=[]
    for container in ('projection','session'):
        target=(state.get(container) or {}).get('target')
        if not isinstance(target,dict):continue
        assert target.get('targetId')==goal_id and target.get('sessionId')==session_id
        result.append({'selector':('/snapshot' if 'snapshot' in value else '')+'/'+container+'/target',
            'targetId':target['targetId'],'sessionId':target['sessionId'],
            'status':target.get('status'),'native_record_updated_at_epoch_ms':target.get('updatedAt')})
    return result

def main():
    request_path=LAB/'ops/dispatcher/CONFIRMATION_C04_STAGE_TRANSITION_001.json'
    assert sha(request_path)==REQUEST_SHA
    selected=next(row for row in json.loads(request_path.read_text())['rows'] if row['job_id']==JOB)
    freeze_path=Path(selected['freeze_ref']['path']);assert sha(freeze_path)==selected['freeze_ref']['sha256']
    run=freeze_path.parent;native=run/'native';freeze=json.loads(freeze_path.read_text())
    receipt_path=Path(freeze['native_receipt']['path']);assert sha(receipt_path)==freeze['native_receipt']['sha256']
    receipt=json.loads(receipt_path.read_text());stage_path=run/'stage.json';stage=json.loads(stage_path.read_text())
    assert receipt['job_id']==stage['job_id']==freeze['job_id']==JOB
    assert receipt['error_class']=='ProtocolError' and receipt['error']=='ZCode response timeout: session/read'
    selection=stage['glm_resource'];sources=selection['source_pins']
    for path,digest in sources.items():assert sha(path)==digest
    source_paths={Path(path).name:Path(path) for path in sources}
    assert selection['version']=='glm_complete2304_v2'
    assert selection['tools_config_builder']['path']==str(LAB/'dev/tools/versions/v1.3/config.py')
    assert sha(selection['tools_config_builder']['path'])==selection['tools_config_builder']['sha256']
    binding_path=run/'RESOURCE_BINDING.json';binding=json.loads(binding_path.read_text())
    resource_path=Path(freeze['resource_profile']['path']);assert sha(resource_path)==freeze['resource_profile']['sha256']
    resource=json.loads(resource_path.read_text())
    birth=binding['original_birth_monotonic_ns'];total=binding['original_total_stop_monotonic_ns'];action=binding['native_stop_monotonic_ns']
    assert resource['original_birth_monotonic_ns']==birth and resource['original_total_stop_monotonic_ns']==total
    assert total-birth==1_200_000_000_000 and total-action==30_000_000_000
    assert total-binding['guard_stop_monotonic_ns']==5_000_000_000
    assert stage['max_seconds']==receipt['max_seconds']==1200 and stage['max_responses']==receipt['max_responses']==120
    config_path=run/'RESOURCE_TOOLS_CONFIG.json';config=json.loads(config_path.read_text())
    assert config['deadline_monotonic_ns']==total and config['resource_profile_sha256']==sha(resource_path)
    assert config.get('native_bundle_enabled') is not True
    assert receipt['observed_model']=={'providerId':'builtin:zai-coding-plan','modelId':'GLM-5.3-Flash'} and receipt['observed_effort']=='max'
    goal_id=receipt['goal_target_id'];session_id=receipt['session_id']
    activation_path=native/'activation.json';activation=json.loads(activation_path.read_text())
    assert activation['startedTurn'] is True
    activation_goals=projected_target(activation,goal_id,session_id)
    assert activation_goals and all(row['status']=='active' for row in activation_goals)
    wire_path=native/'protocol.redacted.jsonl';outgoing=[];incoming={};model=[];turn=[];tools=Counter();host=[];mcp=[];parse_errors=0
    for line_number,line in enumerate(wire_path.open(),1):
        envelope=json.loads(line);message=envelope.get('message') or {};direction=envelope.get('direction')
        method=message.get('method');params=message.get('params') or {};request_id=str(message.get('id'))
        parse_errors+=int(envelope.get('parse_error') is True)
        if direction=='out' and method:
            row={'line_number_1based':line_number,'host_observed_utc':envelope.get('at'),'method':method,'request_id':request_id}
            if method in {'session/read','session/goal','session/stop','session/close','v4/conversation/usage'}:
                row.update({k:params[k] for k in ('sessionId','action','messageLimit') if k in params})
            outgoing.append(row)
        if direction=='in' and message.get('id') is not None and method is None:
            row={'line_number_1based':line_number,'host_observed_utc':envelope.get('at'),'request_id':request_id,'rpc_error': 'error' in message}
            if request_id in {'research-host-459','research-host-460','research-host-461','research-host-463'}:
                row['direct_goal_objects']=projected_target(message.get('result') or {},goal_id,session_id)
            incoming[request_id]=row
        if direction=='in' and method and message.get('id') is not None:
            host.append({'line_number_1based':line_number,'host_observed_utc':envelope.get('at'),'method':method})
        if method=='process/mcpTelemetry':
            mcp.append({'line_number_1based':line_number,'host_observed_utc':envelope.get('at'),
                **{k:params.get(k) for k in ('kind','configuredCount','connectedCount','failedCount','processCount','orphanSuspected')}})
        if method!='v4/telemetry/event':continue
        if params.get('kind')=='tool.lifecycle':tools[(params.get('toolName'),params.get('phase'))]+=1
        if params.get('kind')=='model.request.status':
            model.append({'line_number_1based':line_number,'host_observed_utc':envelope.get('at'),
                **{k:params.get(k) for k in ('requestId','status','durationMs','attempt','maxAttempts','retryable','querySource')}})
        if params.get('kind')=='turn.terminal':
            turn.append({'line_number_1based':line_number,'host_observed_utc':envelope.get('at'),
                **{k:params.get(k) for k in ('status','durationMs','resultType','errorCode','toolCallCount')}})
    by_id={row['request_id']:row for row in outgoing}
    last=by_id['research-host-460'];pause=by_id['research-host-461'];late=incoming['research-host-460']
    assert last['method']=='session/read' and pause['method']=='session/goal' and pause['action']=='pause'
    assert last['sessionId']==pause['sessionId']==session_id
    assert last['line_number_1based']<pause['line_number_1based']<late['line_number_1based']
    assert all(row['status']=='active' for row in late['direct_goal_objects'])
    assert all(row['status']=='paused' for row in incoming['research-host-461']['direct_goal_objects'])
    assert parse_errors==0
    # Observer wallclock/monotonic projection is expressly estimated. Exact
    # controller clamped timeout/remaining-at-send was not separately exposed.
    estimated_action_epoch=receipt['birth_epoch']+(action-birth)/1e9
    estimated_remaining_ms=(estimated_action_epoch-epoch(last['host_observed_utc']))*1000
    assert 0<estimated_remaining_ms<100
    operations_path=Path(selection['evidence_dir'])/'events.jsonl';operation_counts=Counter()
    for line in operations_path.open():
        value=json.loads(line);operation_counts[(value.get('tool'),value.get('stage'),value.get('is_error'))]+=1
    final_path=native/'final-session.redacted.json';final=json.loads(final_path.read_text());final_goals=projected_target(final,goal_id,session_id)
    assert final_goals and all(row['status']=='paused' for row in final_goals)
    exporter_path=LAB/'dev/execution/status-projection/export.py'
    spec=importlib.util.spec_from_file_location('c04_direct_goal_metadata',exporter_path);exporter=importlib.util.module_from_spec(spec);spec.loader.exec_module(exporter)
    direct=exporter.project({'job_id':JOB,'pair_id':stage['pair_id'],'arm':stage['arm'],'stage':stage['stage'],'status':'FAILED'},receipt_path)
    assert direct['native_goal_status']=='paused'
    release_path=run/'PRIVATE_SLICE_RELEASE.json';release=json.loads(release_path.read_text())
    assert release['all_private_slice_descendants_quiet'] is True
    components=[]
    for name in ('native-host.json','pm_boundary-resource.json','pm_execution-resource.json'):
        path=native/name;value=json.loads(path.read_text())
        assert value['verified_before_command_exec'] is True and value['cgroup_absent_or_empty'] is True
        assert value['immutable_stop_monotonic_ns']==binding['guard_stop_monotonic_ns']
        components.append({'source':ref(path),'component':value['component'],
            'verified_before_command_exec':True,'cgroup_absent_or_empty':True,'service_runner_exit_code':value.get('service_runner_exit_code'),
            'stop_reason':value.get('stop_reason'),'closed_monotonic_ns':value.get('closed_monotonic_ns')})
    assert receipt['resource_oom_observed'] is False and receipt['resource_components_quiet'] is True
    assert receipt['cleanup']['native_quiescent'] is True and freeze['operational_complete'] is False
    source_lines=[]
    selectors={'native_support.py':['deadline=time.monotonic()+timeout',"raise ProtocolError('ZCode response timeout: '+method)"],
        'glm_stage.py':['remaining=(deadline if cleanup else deadline-30)-time.monotonic()','return client.request(method,params,timeout=min(timeout,remaining))',
            "if time.monotonic()>=deadline-30: receipt['status']='cap_seconds'; break", "snapshot=call('session/read',{'sessionId':sid,'messageLimit':200})",'except Exception as exc:',
            "receipt.update({'status':'execution_error','error_class':type(exc).__name__,'error':ns.sanitized(str(exc))})"],
        'profile.py':['return stop,stop-30_000_000_000,stop-5_000_000_000']}
    for name,needles in selectors.items():
        source=source_paths[name];lines=source.read_text().splitlines()
        for needle in needles:
            found=[(i,line.strip()) for i,line in enumerate(lines,1) if line.strip()==needle]
            assert found,(name,needle)
            source_lines.extend({'source':ref(source),'line_number_1based':i,'neutral_source':line} for i,line in found)
    created=datetime.now(timezone.utc).isoformat()
    diagnosis={'schema':'er9.c04-original-clock-rpc-timeout-diagnosis.v1','created_utc':created,'job_id':JOB,
        'classification':'SESSION_READ_RPC_TIMEOUT_AT_ORIGINAL_ACTION_CUTOFF',
        'classification_scope':'Additive control-plane diagnosis only; preserves original execution_error and operational FAILED. No source bug or causal explanation of non-completion is established.',
        'exposed_error':{'source':ref(receipt_path),'error_class':receipt['error_class'],'error':receipt['error'],'selectors':['/error_class','/error']},
        'operational_outcome':{'source':ref(freeze_path),'operational_complete':False,'router_terminal_status':receipt['status'],
            'original_native_goal_starts':freeze['native_goal_starts'],'original_native_responses':freeze['native_responses'],
            'native_elapsed_seconds':receipt['elapsed_seconds'],'whole_freeze_elapsed_seconds':freeze['elapsed_seconds'],
            'required_presence_checked_by_operator':selected['frozen_structural_fields']['missing_required_artifacts']==[],
            'artifact_contents_and_inventory_read':False,'semantic_grade':'OUTSIDE_SCOPE'},
        'actual_runtime':{'source':ref(stage_path),'version':selection['version'],'family':'Z','model':selection['model'],'effort':selection['effort'],
            'actual_research_builder':selection['tools_config_builder'],'actual_tool_config':ref(config_path),
            'actual_research_bundle_carrier_enabled':False,'label_definition':'BUNDLE in pair/job name denotes its preclosed pipeline/final transport choice, not this research builder. No family/version inferred from suffix.',
            'all_selected_runtime_source_pins_match':True,'runtime_source_pins':sources,'source_code_evidence':source_lines},
        'original_clock':{'source':ref(binding_path),'original_birth_monotonic_ns':birth,'original_action_stop_monotonic_ns':action,
            'original_total_cleanup_stop_monotonic_ns':total,'original_guard_stop_monotonic_ns':binding['guard_stop_monotonic_ns'],
            'original_stage_allocation_seconds':1200,'action_stop_seconds_from_original_birth':1170,'guard_stop_seconds_from_original_birth':1195,
            'tool_lifecycle_deadline_monotonic_ns':config['deadline_monotonic_ns'],'response_cap':120,
            'definition':'Original admission birth retained; setup/cleanup included. The 1175.319s freeze includes cleanup and does not shorten/reset/extend the 1200s allocation.'},
        'timeout_control_evidence':{'source':ref(wire_path),'last_ordinary_read':last,'cleanup_pause_request':pause,'late_read_reply':late,
            'pause_reply':incoming['research-host-461'],'final_cleanup_read_reply':incoming['research-host-463'],
            'source_policy':'Ordinary RPC timeout=min(default45s, original action remaining); poll timeout raises ProtocolError; generic except preserves execution_error label.',
            'exact_remaining_at_send_ms':'UNEXPOSED','exact_rpc_timeout_seconds':'UNEXPOSED',
            'estimated_remaining_ms_from_observer_wallclock':estimated_remaining_ms,'estimated_action_cutoff_utc_from_saved_birth_epoch':utc(estimated_action_epoch),
            'estimated_timing_definition':'Saved controller birth_epoch projects monotonic original action stop onto observer wall time; this is not an independent physical native start/end or exact recorded timeout.',
            'late_reply_after_pause_sent_seconds':epoch(late['host_observed_utc'])-epoch(pause['host_observed_utc']),
            'upstream_handler_generation_time_and_latency_cause':'UNEXPOSED/UNKNOWN; host receipt time is not native generation time'},
        'direct_native_goal':direct,'positive_activation':{'source':ref(activation_path),'startedTurn':True,'goal_objects':activation_goals},
        'native_record_and_observer_time_policy':{'native_goal_updatedAt':'Actual saved native target-record update time, separate from host observation, physical execution and transition event.',
            'native_receipt_start_utc':{'value':receipt['start_utc'],'definition':'Controller receipt constructed before Protocol/native spawn; not physical native start UTC'},
            'native_receipt_ended_utc':{'value':receipt['ended_utc'],'definition':'Controller receipt finalized after cleanup; not physical native end UTC'},
            'physical_native_start_utc':'UNEXPOSED','physical_native_end_utc':'UNEXPOSED'},
        'model_request_control':{'source':ref(wire_path),'counts':dict(Counter(row['status'] for row in model)),
            'tail':model[-5:],'attempts_greater_than_one_observed':sum(type(row['attempt']) is int and row['attempt']>1 for row in model),
            'turn_terminal_metadata':turn,'whole_cost':'Prior accounting preserved; counts are lifecycle metadata, not inclusive billed usage. Cancelled/unexposed tails remain UNKNOWN.'},
        'tool_control':{'source':ref(wire_path),'counts':[{'tool':key[0],'phase':key[1],'count':count} for key,count in tools.items()],
            'source_receipt':ref(operations_path),'source_operation_counts':[{'tool':key[0],'stage':key[1],'is_error':key[2],'count':count} for key,count in operation_counts.items()],
            'parse_errors':parse_errors,'host_requests':host,'mcp_telemetry':mcp,
            'tool_arguments_results_sources_and_authored_artifacts_read':False,'unexposed_tool_error_causes':'UNKNOWN; no error body/source payload read'},
        'resource_cleanup':{'resource_profile':ref(resource_path),'native_receipt':ref(receipt_path),'native_quiet':True,'components_quiet':True,
            'oom_observed':False,'component_receipts':components,'private_slice_release':ref(release_path),'recursive_owned_quiet':True,
            'release_monotonic_ns':release.get('release_monotonic_ns'),'physical_resource_fit_beyond_this_saved_attempt':'UNKNOWN'},
        'unknowns':['why the genuine Goal remained active despite operator-observed artifact presence','semantic adequacy/source quality',
            'upstream request handler latency, native generation times, pipeline or shared-platform contribution','unexposed permission/provider/body error facts','whole-dollar billing and cancelled tails'],
        'action':'Preserve original FAILED/cost/native Goal/clock and active old pair. No patch, retry, reopen, budget reset, model substitution or automatic quality rescue. Optional future source-pinned timeout provenance fields may clarify diagnostics only under a separate prospective closure.',
        'new_native_goal_model_canary_or_probe_calls':0,'runtime_live_job_or_others_edits':0,'candidate_science_body_selection':0}
    save('DIAGNOSIS.json',diagnosis)
    save('NATIVE_GOAL_STATUS.json',{'schema':'er9.direct-native-goal-status.v1','created_utc':created,'jobs':[direct],
        'scope':'One exact terminal C04 treatment research native target; original failure and cost retained. No current/live Goal observation.'})
    save('VERIFICATION.json',{'schema':'er9.c04-control-projection-verification.v1','created_utc':created,'status':'PASS_METADATA_ONLY',
        'request_freeze_native_and_runtime_pins_match':True,'selected_runtime_source_pin_count':len(sources),
        'error_exact_known_neutral_source_pattern':True,'original_action_total_guard_clock_identity':True,
        'late_rpc_reply_after_cleanup_pause_request':True,'late_read_active_then_direct_final_paused_same_goal_session':True,
        'resource_and_recursive_release_quiet':True,'protocol_parse_errors':parse_errors,'native_model_goal_calls':0,
        'no_artifact_or_candidate_body_reads':True,'all_original_or_live_files_unchanged':True})
    print(json.dumps({'classification':diagnosis['classification'],'direct_native_goal_status':direct['native_goal_status'],
        'original_operational_complete':False,'source_pins_checked':len(sources),'new_native_goal_calls':0}))

if __name__=='__main__':main()
