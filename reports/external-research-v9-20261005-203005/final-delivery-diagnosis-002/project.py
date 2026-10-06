"""Three pinned final control surfaces. No reasoning/science/output selection."""
from collections import Counter, defaultdict, deque
from datetime import datetime, timezone
import hashlib
import importlib.util
import json
from pathlib import Path, PurePosixPath
import re

HERE=Path(__file__).resolve().parent;LAB=HERE.parents[4]
START='2026-10-06T08:35:52+00:00'

def sha(path):return hashlib.sha256(Path(path).read_bytes()).hexdigest()
def ref(path):return {'path':str(Path(path).absolute()),'sha256':sha(path)}
def checked(reference):
    path=Path(reference['path']);assert sha(path)==reference['sha256'];return path
def save(name,value):
    with (HERE/name).open('x') as out:json.dump(value,out,indent=2);out.write('\n')
def canonical(raw):return json.dumps(raw,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()
def imported_path_table(stage):
    result=[]
    for path,digest in stage['input_pins'].items():
        rel=Path(path).relative_to(stage['workspace']).as_posix()
        if not rel.startswith('inputs/prior/'):continue
        original=Path(path);assert sha(original)==digest
        result.append({'path':rel,'sha256':digest,'bytes':original.stat().st_size})
    return result
def safe_file_state(workspace,path):
    if not isinstance(path,str):return 'UNEXPOSED'
    relative=PurePosixPath(path)
    if relative.is_absolute() or '..' in relative.parts or relative.parts[0] not in {'inputs','out','TASK.md'}:
        return 'OUTSIDE_CANONICAL_CANDIDATE_NAMESPACE'
    location=Path(workspace)/path
    return 'REGULAR_FILE' if location.is_file() else 'DIRECTORY' if location.is_dir() else 'ABSENT'

def main():
    selector_path=LAB/'ops/dispatcher/G_FINAL_DELIVERY_DIAGNOSIS_002_METADATA_SELECTOR.json'
    assert sha(selector_path)=='929f676a2328b6c5c74c137779b088d3ddd5ff34e36e375613421ddd0aab3331'
    selector=json.loads(selector_path.read_text());jobs=[];goals=[]
    export_path=LAB/'dev/execution/status-projection/export.py'
    spec=importlib.util.spec_from_file_location('final002_saved_goal_status',export_path);export=importlib.util.module_from_spec(spec);spec.loader.exec_module(export)
    for row in selector['rows']:
        refs=row['refs'];stage=json.loads(checked(refs['stage.json']).read_text());root=Path(row['run_root'])
        receipt_path=checked(refs['native/receipt.json']);receipt=json.loads(receipt_path.read_text())
        freeze=json.loads(checked(refs['OUTPUT_FREEZE.json']).read_text());binding_path=checked(refs['RESOURCE_BINDING.json']);binding=json.loads(binding_path.read_text())
        config_binding_path=checked(refs['RESOURCE_CONFIG_BINDING.json']);config_binding=json.loads(config_binding_path.read_text())
        config_path=root/'RESOURCE_TOOLS_CONFIG.json';config=json.loads(config_path.read_text())
        assert row['job_id']==stage['job_id']==receipt['job_id'] and stage['max_seconds']==receipt['max_seconds']==600
        assert stage['max_responses']==receipt['max_responses']==60 and receipt['goal_activated'] is True
        assert binding['original_total_stop_monotonic_ns']-binding['original_birth_monotonic_ns']==600_000_000_000
        assert binding['native_stop_monotonic_ns']-binding['original_birth_monotonic_ns']==570_000_000_000
        assert config['deadline_monotonic_ns']==binding['original_total_stop_monotonic_ns']
        assert config['native_bundle_enabled'] is True and config['clock_profile_sha256']==config_binding['clock_profile']['sha256']
        checked(config_binding['clock_profile']);checked(config_binding['initial_clock_input'])
        assert config['initial_clock_metadata']['stage_clock']['original_candidate_action_deadline_monotonic_ns']==binding['native_stop_monotonic_ns']
        assert config['initial_clock_metadata']['stage_clock']['stage_id']==stage['job_id']
        assert receipt['observed_model']=={'providerId':'builtin:zai-coding-plan','modelId':'GLM-5.3-Flash'} and receipt['observed_effort']=='max'
        for path,digest in stage['glm_resource']['source_pins'].items():assert sha(path)==digest
        profile_path=Path(config['bundle_profile_path']);assert sha(profile_path)==config['bundle_profile_sha256'];profile=json.loads(profile_path.read_text())
        assert profile['stage_id']==stage['job_id'] and profile['arm_id']==stage['arm']
        manifest_path=Path(stage['workspace'])/profile['import_manifest']['path'];manifest=json.loads(manifest_path.read_text())
        assert sha(manifest_path)==profile['import_manifest']['sha256'] and manifest['entries']==[]
        role_birth_path=checked(row['actual_role_birth_binding']);role_birth=json.loads(role_birth_path.read_text())
        assert role_birth['job_id']==stage['job_id']
        task=checked(row['Task_ref']);assert sha(task)==stage['prompt_sha256']
        raw_task=task.read_bytes()
        # Exact literal namespace/path tokens only. No surrounding Task prose,
        # scientific obligations, criteria or authored text decoded/selected.
        task_tokens=sorted(set(match.decode('ascii').rstrip('.') for match in re.findall(rb'(?:inputs/prior|out/final|out/final_bundle)[A-Za-z0-9_./*\-]*',raw_task)))
        prior_table=imported_path_table(stage)
        exact_prior_tokens=[path for path in task_tokens if path in {item['path'] for item in prior_table}]
        pinned_index_paths=[str(Path(path).relative_to(stage['workspace'])) for path in stage['input_pins']
            if Path(path).name.lower() in {'index.md','index.json','navigation.json','available_inputs.json','prior_files_index.json','input_files.json','readme.md'}]
        # Indexes inside source_context describe opaque source captures; they
        # are not a root prior-file locator and their contents are never read.
        root_prior_indexes=[path for path in pinned_index_paths if str(PurePosixPath(path).parent) in {'inputs','inputs/prior'}]
        operation_path=Path(stage['glm_resource']['evidence_dir'])/'events.jsonl';op_counts=Counter();read_results=defaultdict(deque)
        for line_number,line in enumerate(operation_path.open(),1):
            value=json.loads(line);op_counts[(value.get('tool'),value.get('stage'),value.get('is_error'))]+=1
            if value.get('tool')=='read_file' and value.get('stage')=='prepared-result':
                read_results[value['argument_sha256']].append({'source_line_number_1based':line_number,'is_error':value['is_error'],
                    'successful_source_path':(value.get('source_evidence') or {}).get('path') if value['is_error'] is False else None,
                    'error_class':'UNEXPOSED_IN_SOURCE_RECEIPT' if value['is_error'] else None})
        wire_path=checked(refs['native/protocol.redacted.jsonl']);counts=Counter();model=[];hosts=[];mcp=[];turn=[];writes=[];parse_errors=0;calls=[];replies={}
        for line_number,line in enumerate(wire_path.open(),1):
            envelope=json.loads(line);message=envelope.get('message') or {};params=message.get('params') or {};method=message.get('method');direction=envelope.get('direction')
            parse_errors+=int(envelope.get('parse_error') is True)
            if direction=='in' and method and 'id' in message:hosts.append({'line_number_1based':line_number,'method':method,'host_observed_utc':envelope.get('at')})
            if direction=='out' and method in {'session/read','session/goal','session/stop','session/close'}:
                calls.append({'line_number_1based':line_number,'request_id':str(message['id']),'method':method,'action':params.get('action'),'host_observed_utc':envelope.get('at')})
            if direction=='in' and 'id' in message and not method:
                replies[str(message['id'])]={'line_number_1based':line_number,'rpc_error': 'error' in message,'host_observed_utc':envelope.get('at')}
            if method=='process/mcpTelemetry':mcp.append({'line_number_1based':line_number,**{k:params.get(k) for k in ('kind','configuredCount','connectedCount','failedCount')}})
            if method!='v4/telemetry/event':continue
            if params.get('kind')=='tool.lifecycle':
                counts[(params.get('toolName'),params.get('phase'))]+=1
                if params.get('toolName')=='mcp__pm_boundary__write_file':writes.append({'line_number_1based':line_number,'phase':params.get('phase'),'toolCallId':params.get('toolCallId')})
            if params.get('kind')=='model.request.status':model.append({'line_number_1based':line_number,**{k:params.get(k) for k in ('requestId','status','attempt','maxAttempts','retryable','querySource')}})
            if params.get('kind')=='turn.terminal':turn.append({'line_number_1based':line_number,**{k:params.get(k) for k in ('status','resultType','durationMs','errorCode')}})
        io_path=checked(refs['native/model-io.redacted.jsonl']);read_calls=[];mechanical_calls=[];advertisements=[]
        for line_number,line in enumerate(io_path.open(),1):
            saved=json.loads(line);assert saved['sessionId']==receipt['session_id']
            request=saved.get('request') or {};body=request.get('body') or {};definitions=body.get('tools') if isinstance(body,dict) else None
            names=[];read_schema=None;writer_schema=None
            if isinstance(definitions,list):
                for definition in definitions:
                    d=definition.get('function') if isinstance(definition.get('function'),dict) else definition
                    name=d.get('name');schema=d.get('parameters',d.get('input_schema',{}));names.append(name)
                    keys=list(schema.get('properties',{})) if isinstance(schema,dict) else []
                    if name=='mcp__pm_boundary__read_file':read_schema=keys
                    if name=='mcp__pm_boundary__write_file':writer_schema=keys
            advertisements.append({'line_number_1based':line_number,'tool_names':names if definitions is not None else 'UNEXPOSED',
                'read_property_names':read_schema,'writer_property_names':writer_schema})
            # Formal invocation controls only. response.text/reasoningText,
            # headers and every scientific argument/value are never selected.
            for index,invocation in enumerate((saved.get('response') or {}).get('toolCalls') or []):
                name=invocation.get('name');args=invocation.get('input')
                if not isinstance(args,dict):continue
                if name=='mcp__pm_boundary__read_file':
                    digest=hashlib.sha256(canonical(args)).hexdigest();matches=read_results[digest]
                    evidence=matches.popleft() if matches else {'source_result_join':'UNEXPOSED'}
                    read_calls.append({'model_metadata_line_number_1based':line_number,'tool_call_index':index,'call_id':invocation.get('id'),
                        'argument_key_names':sorted(args),'path':args.get('path'),
                        'range_scalars':{k:args[k] for k in ('line_start','line_count','byte_start','byte_count') if k in args},
                        'argument_sha256':digest,'saved_namespace_state':safe_file_state(stage['workspace'],args.get('path')),
                        'exact_declared_prior_file':args.get('path') in {p['path'] for p in prior_table},'source_result':evidence})
                elif name=='mcp__pm_boundary__mechanical':
                    mechanical_calls.append({'model_metadata_line_number_1based':line_number,'operation':args.get('operation'),
                        'source_path':args.get('source') if isinstance(args.get('source'),str) and args['source'].startswith(('inputs/','out/')) else 'UNEXPOSED_NONPATH_VALUE',
                        'argument_key_names':sorted(args)})
        assert not writes and op_counts[('write_file','operation-started',None)]==0
        assert parse_errors==0
        projected=export.project({'job_id':stage['job_id'],'pair_id':stage['pair_id'],'arm':stage['arm'],'stage':stage['stage'],'status':row['status']},receipt_path)
        goals.append(projected)
        release_path=checked(refs['PRIVATE_SLICE_RELEASE.json']);release=json.loads(release_path.read_text())
        assert release['all_private_slice_descendants_quiet'] is True and freeze['native_quiescent'] is True and receipt['resource_components_quiet'] is True and receipt['resource_oom_observed'] is False
        source_host=LAB/'dev/tools/versions/v1.5-clock-telemetry/source_capture/tool_server.py'
        boundary_path=LAB/'dev/tools/versions/v1.5-clock-telemetry/source_capture/boundary.py'
        collector=LAB/'dev/execution/glm-resource-v1/versions/v1.3-bundle-clock-telemetry/stage_worker.py'
        output_map={name:profile['allowed_outputs'][name] for name in sorted(profile['allowed_outputs'])}
        assert set(output_map.values())==set(stage['required_artifacts'])
        row_result={'job_id':stage['job_id'],'pair_id':stage['pair_id'],'arm':stage['arm'],'source':ref(receipt_path),
            'classification':'ORIGINAL_ACTION_CAP_WITH_NO_OBSERVED_WRITER_DISPATCH_AND_PRIOR_PATH_DISCOVERABILITY_LIMIT',
            'router_status':receipt['status'],'error_class':receipt.get('error_class'),
            'exposed_error':receipt.get('error') if receipt.get('error') in {'ZCode response timeout: session/read','Original stage deadline exhausted'} else None,
            'operational_complete':False,'missing_required_paths':freeze['missing_required_artifacts'],'direct_native_goal':projected,
            'clock':{'source':ref(binding_path),'allocation_seconds':600,'response_cap':60,'router_native_responses':receipt['native_responses'],
                **{k:binding[k] for k in ('original_birth_monotonic_ns','native_stop_monotonic_ns','guard_stop_monotonic_ns','original_total_stop_monotonic_ns')},
                'native_elapsed_seconds':receipt['elapsed_seconds'],'freeze_elapsed_seconds':freeze['elapsed_seconds'],
                'clock_descriptor':config_binding['clock_profile'],'initial_clock_input':config_binding['initial_clock_input'],
                'initial_clock_status':config['initial_clock_metadata']['stage_clock']['action_deadline_status'],
                'definition':'Original600 allocation includes setup/cleanup;570 action,595 component guardian,600 outer. Initial snapshot before Goal, not timer reset; physical native start/end UTC unexposed.'},
            'output_path_contract':{'task_source':row['Task_ref'],'literal_static_path_tokens':task_tokens,'expected_final_paths':stage['required_artifacts'],
                'profile':ref(profile_path),'carrier_bundle_path':profile['bundle_path'],'carrier_commit_dir':profile['commit_dir'],'allowed_outputs':output_map,
                'actual_candidate_RW_root':str(Path(stage['workspace'])/'out'),'MCP_RW_root':'/work/out mounted from that exact workspace/out',
                'collector_root':str(Path(stage['workspace'])/'out'),'boundary_source':ref(boundary_path),'collector_source':ref(collector),
                'path_alignment_supported':True,'writer_permission_or_carrier_rejection_observed':False,'writer_not_attempted':True},
            'prior_path_contract':{'role_birth_receipt':ref(role_birth_path),'actual_prior_file_inventory':prior_table,
                'Task_exact_prior_file_locator_tokens':exact_prior_tokens,'root_prior_index_paths_in_admitted_inputs':root_prior_indexes,
                'candidate_read_manifest':ref(manifest_path),'adoption_entry_count':0,'INLINE_ONLY_intentional':True,
                'manifest_definition':'Final transport/adoption manifest intentionally has zero entries. It is not an actual source import inventory, nor proof of lost imports.',
                'imports_present_and_hash_verified':True,'tool_schema_source':ref(source_host),
                'source_read_argument_fields':['path','line_start','line_count','byte_start','byte_count'],
                'supported_mechanical_operations':['line_map','render_sections','cache_source'],'directory_listing_tool_in_selected_API':False,
                'native_internal_workspace_or_prompt_inventory':'UNEXPOSED; provider/System/candidate prose was not inspected',
                'scope':'No exact own prior-file locator in inspected static Task tokens or root input-index contract; cannot make a global model-context absence claim.'},
            'formal_read_controls':read_calls,'mechanical_control_calls':mechanical_calls,
            'formal_metadata_source':ref(io_path),'formal_metadata_selectors':['/response/toolCalls/*/name','/response/toolCalls/*/id','/response/toolCalls/*/input/path','range scalar keys only','/request/body/tools names and schema property key names only'],
            'advertised_schema_metadata':advertisements,
            'source_operations':{'source':ref(operation_path),'counts':[{'tool':t,'stage':s,'is_error':e,'count':c} for (t,s,e),c in op_counts.items()],
                'error_category':'UNEXPOSED in saved operation receipts; source returns boundary failure + exception typename, but no result/error body selected'},
            'native_control':{'source':ref(wire_path),'tool_counts':[{'tool':t,'phase':p,'count':c} for (t,p),c in counts.items()],
                'writer_count':0,'host_requests':hosts,'mcp':mcp,'turn_terminal_metadata':turn,'parse_errors':0,
                'model_status_counts':dict(Counter(m['status'] for m in model)),'attempts_gt1_observed':sum(type(m['attempt']) is int and m['attempt']>1 for m in model),
                'RPC_tail':[{**c,'reply':replies.get(c['request_id'])} for c in calls[-8:]],
                'permission_request_or_denial_in_host_callbacks_observed':any(h['method']!='session/requestRuntimePreferences' for h in hosts)},
            'cleanup':{'native_quiet':True,'components_quiet':True,'oom_observed':False,'recursive_private_quiet':True,'release_ref':ref(release_path)},
            'systemic_writer_tool_schema_transport_or_RW_fault_proven':False,
            'positive_navigation_limit':'Admitted files are nested by origin job. Formal read requests guess absent flat/index paths; source rejects them. Selected API cannot enumerate a directory; inspected static Task/INLINE_ONLY manifest provides no exact prior-file path list.',
            'causality':'UNKNOWN: cannot infer why model never dispatches writer, effect of index availability, scientific adequacy or global hidden context from these control surfaces.',
            'costs':'All original charged attempts and inclusive occupied clocks preserved; no dollars/full billing inferred from router counters. Cancelled/provider tails remain accounting UNKNOWN.'}
        jobs.append(row_result)
    created=datetime.now(timezone.utc).isoformat()
    output={'schema':'er9.final-delivery-control-diagnosis.v2','task_start_utc':START,'created_utc':created,'selector':ref(selector_path),'jobs':jobs,
        'bounded_scope':3,'intentional_inline_only_counterevidence_preserved':True,
        'recommendation':'Prospective source-owned mechanical index of only the already authorized own-prior relative file paths, SHA256 and byte lengths (or explicit own-prior paths in a declared neutral fragment). Keep empty INLINE_ONLY adoption manifest separate. No content summaries, source findings, hints, answer repair, broader access or directory tool. Fixed linking rule/serializer and actual input/Task hashes before Goal under a separately pinned symmetric eligible role closure; original clocks/model/factors remain unchanged. Do not implement or retry in this diagnosis.',
        'confirmed_engineering_fault':'No writer/transport/schema/permission/RW fault proven. A narrow path discoverability contract limitation is directly supported; failed delivery causality remains UNKNOWN.',
        'no_auto_rerun_candidate_hints_or_current_source_edits':True,'new_model_Goal_provider_account_calls':0,'candidate_reasoning_science_or_authored_output_selected':0}
    save('DIAGNOSIS.json',output)
    save('NATIVE_GOAL_STATUS.json',{'schema':'er9.direct-native-goal-status.v1','created_utc':created,'jobs':goals,
        'scope':'Only the three exact terminal native final snapshots; status separate from router/artifact/quality/cost.'})
    save('VERIFICATION.json',{'schema':'er9.final-delivery-metadata-verification.v2','created_utc':created,'status':'PASS_METADATA_ONLY',
        'selected_terminal_jobs':3,'all_original600_action570_clocks_match':True,'all_actual_outputs_RWMCP_collector_roots_align':True,
        'all_pristine_imported_prior_pins_hash_match':True,'all_inline_only_manifests_match_profiles_and_zero_entry_intent':True,
        'all_three_writer_calls_observed':0,'all_three_protocol_parse_errors':0,'all_recursive_owned_quiet_and_noOOM':True,
        'no_candidate_reasoning_or_semantic_fields_selected':True,'no_runtime_or_source_edits':True,'no_model_native_Goal_calls':True})
    print(json.dumps({'selected':3,'writer_calls':0,'read_controls':[len(j['formal_read_controls']) for j in jobs],
        'failed_read_counts':[sum(c['source_result'].get('is_error') is True for c in j['formal_read_controls']) for j in jobs],
        'prior_exact_locator_tokens':[len(j['prior_path_contract']['Task_exact_prior_file_locator_tokens']) for j in jobs],
        'direct_goal_statuses':[g['native_goal_status'] for g in goals],'new_Goal_calls':0}))

if __name__=='__main__':main()
