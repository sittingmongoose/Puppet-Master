"""Finite fresh standalone native Luna stage, with trusted generic ER9 MCP tools."""
import argparse
import hashlib
import importlib.util
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import time
import sys

VERSION_HERE=Path(__file__).resolve().parent
SOURCE_ROOT=VERSION_HERE.parents[1]
sys.path.insert(0,str(SOURCE_ROOT))
from controls import CLI, MODEL, EFFORT, projected_config_check
from native_driver import initialize, exact_catalog, stop_native
from completion_driver import CompletionProtocol as DynamicProtocol
from completion_policy import establish_native_complete
from resource_owned_scope_proof import prove as owned_scope_prove
from resource_client_relay import ClientToolRelay
from resource_tool_release import load_tools, TOOLS
from resource_slice import load as load_resource,own_placement,verify as verify_resource,kernel as resource_kernel,verify_pid_placement
from projector import ident

HERE=SOURCE_ROOT


def sha(path):return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def absent(pgid):
    if not pgid:return False
    for path in Path('/proc').glob('[0-9]*/stat'):
        try:
            text=path.read_text();fields=text[text.rfind(')')+2:].split()
            if int(fields[2])==pgid and fields[0]!='Z':return False
        except (OSError,ValueError,IndexError):pass
    return True


def quiet_executions(evidence,total_stop):
    rows=[]
    for path in sorted(evidence.glob('executions/*/request.json')):
        unit=json.loads(path.read_text())['unit']
        if not re.fullmatch(r'er9-exec-[0-9a-f]{32}\.service',unit):raise ValueError('owned execution unit identity drift')
        quiet=False;fields={};cg=None
        while time.monotonic_ns()<total_stop:
            proc=subprocess.run(['/usr/bin/systemctl','--user','show',
                '--property=ActiveState,ControlGroup',unit],capture_output=True,text=True,timeout=2,
                env={'PATH':'/usr/bin:/bin','HOME':str(Path.home()),
                     'XDG_RUNTIME_DIR':'/run/user/'+str(os.getuid()),
                     'DBUS_SESSION_BUS_ADDRESS':'unix:path=/run/user/'+str(os.getuid())+'/bus'})
            fields=dict(line.split('=',1) for line in proc.stdout.splitlines() if '=' in line)
            cg=fields.get('ControlGroup');cpath=Path('/sys/fs/cgroup')/cg.lstrip('/') if cg else None
            empty=not cpath or not cpath.exists() or not (cpath/'cgroup.procs').read_text().strip()
            quiet=fields.get('ActiveState') in ('inactive','failed') and empty
            if quiet:break
            time.sleep(.1)
        rows.append({'unit':unit,'quiet':quiet,'state':fields.get('ActiveState'),'control_group':cg})
    return rows


def execute(args):
    birth_ns=args.birth_monotonic_ns or time.monotonic_ns();birth_epoch=time.time()
    total_stop=birth_ns+int(args.max_seconds*1e9);native_stop=total_stop-15_000_000_000
    resource=load_resource(args.resource_profile)
    if resource['original_birth_monotonic_ns']!=birth_ns or resource['original_total_stop_monotonic_ns']!=total_stop:raise ValueError('original resource clock drift')
    outer_placement=own_placement(resource)
    if time.monotonic_ns()>=native_stop:raise ValueError('original stage deadline already exhausted')
    if not args.workspace.is_dir() or any(p.is_symlink() for p in (args.workspace,*args.workspace.parents)):
        raise ValueError('real trusted workspace required')
    args.out.mkdir(mode=0o700,parents=True,exist_ok=False)
    private=args.out/'host-private';private.mkdir(mode=0o700)
    auth_home=private/'codex-home';auth_home.mkdir(mode=0o700)
    auth=auth_home/'auth.json';shutil.copyfile(args.auth_source,auth);auth.chmod(0o600)
    body=args.prompt_file.read_text().strip()
    if body.startswith('/goal\n'):body=body.split('\n',1)[1]
    objective=body if len(body)<=4000 else ('Complete the assigned ER9 stage exactly as described in TASK.md and its inputs. '
        'Deliver the required complete stage artifact before marking this native Goal complete. '
        'Stage label: '+args.label+'. TASK.md SHA-256: '+sha(args.workspace/'TASK.md')+'.')
    config=load_tools().mcp_configs(args.workspace,deadline_monotonic_ns=native_stop,
                                   execution_enabled=args.execution_enabled,public_get=args.public_get,resource_profile_path=args.resource_profile)
    allowed={}
    for name in config['tool_allowlist']:
        _,server,tool=name.split('__');allowed.setdefault(server,set()).add(tool)
    result={'schema':'er9.luna.client-dynamic-stage.v1.3','label':args.label,'requested_model':MODEL,
        'requested_effort':EFFORT,'original_birth_monotonic_ns':birth_ns,'observed_birth_epoch':birth_epoch,
        'native_stop_monotonic_ns':native_stop,'total_stop_monotonic_ns':total_stop,
        'scored_research':args.scored_research,'model_fallback_allowed':False,
        'preventive_candidate_create_goal_denial':'UNESTABLISHED',
        'goal_policy':'fresh_native_goal_original_clock_monitor_v1',
        'completion_policy':'native_verified_complete_before_stop_then_tail_close_v1.1',
        'quiescence_policy':'exact_owned_pids_and_private_slice_cgroups_v1.3; recorded PGID never implies ownership',
        'stage_quiet_scope':'native/source/adapter/execution only; outer worker and aggregate release separately required by ops',
        'tool_binding':'app-server dynamicTools + item/tool/call -> unchanged confined generic MCP APIs',
        'mcp_admission_policy':'No native MCP servers; globalnever/managednative policy retained; exact configured user-preauthorized client tools',
        'binary_sha256':sha(CLI),'prompt_sha256':sha(args.prompt_file),
        'allowed_client_tools':{k:sorted(v) for k,v in allowed.items()},
        'tools_config_sha256':sha(TOOLS/'config.py'),'execution_server_sha256':sha(TOOLS/'execution_server.py'),
        'tools_source_pins_sha256':sha(TOOLS/'SOURCE_PINS.json'),
        'actual_inference_tool_payload':'UNOBSERVED','http_attempts':'UNKNOWN','cost':'UNKNOWN'}
    for name in ('controls.py','native_driver.py','projector.py','host_guard.py','stage_runner.py','restricted-luna-catalog.json','item-contract.json','client_tool_relay.py','dynamic_driver.py','dynamic_projector.py','dynamic_stage_runner.py','tool_release.py','owned_scope_proof.py'):
        result.setdefault('runtime_source_sha256',{})[name]=sha(HERE/name)
    result['resource_profile_sha256']=sha(args.resource_profile)
    result['resource_allocator_sha256']=sha(HERE/'resource_slice.py')
    result['resource_slice_unit']=resource['slice_unit']
    result['complete_job_memory_max_bytes']=resource['aggregate_memory_max_bytes']
    result['research_resource_fit']='UNKNOWN'
    result['outer_worker_and_aggregate_release']='External ops exact-slice release required after outer worker exits; not claimed by stage quiet'
    result['resource_oom_observed']='UNKNOWN'
    result['outer_resource_placement']=outer_placement
    result['prospective_resource_source_sha256']={name:sha(VERSION_HERE/name) for name in ('resource_host_guard.py','resource_native_driver.py','resource_dynamic_driver.py','resource_client_relay.py','resource_tool_release.py','resource_owned_scope_proof.py')}
    result['prospective_completion_source_sha256']={name:sha(VERSION_HERE/name) for name in ('dynamic_stage_runner.py','completion_policy.py','completion_driver.py','projection.py')}
    def save():
        temp=args.out/'progress.tmp';temp.write_text(json.dumps(result,indent=2)+'\n');os.replace(temp,args.out/'result.json')
    host=None;relay=None
    try:
        save()
        relay=ClientToolRelay(config,args.workspace,private/'client-tools',args.out,total_stop,args.resource_profile)
        result['client_tool_spec_sha256']=hashlib.sha256(json.dumps(relay.specs,sort_keys=True).encode()).hexdigest()
        result['client_tool_inventory']={k:sorted(v) for k,v in relay.allowed.items()}
        host=DynamicProtocol(relay=relay,workspace=args.workspace,private_home=private/'home',codex_home=auth_home,
            proxy_argv=None,stop_ns=total_stop,process_record=args.out/'host-process.json',resource_profile_path=args.resource_profile)
        initialize(host)
        effective=host.call('config/read',{'includeLayers':False,'cwd':str(args.workspace)})
        result['config']=projected_config_check(effective['config'],host.expected_config)
        result['catalog']=exact_catalog(host)
        started=host.call('thread/start',{'model':MODEL,'allowProviderModelFallback':False,
             'cwd':str(args.workspace),'ephemeral':False,'approvalPolicy':'never',
             'sandbox':'workspace-write','config':{'model_reasoning_effort':EFFORT},'dynamicTools':relay.specs})
        result['identity']=host.state.bind_thread(started,args.workspace);result['thread_id']=host.state.thread
        result['native_mcp_catalog']=host.state.mcp_catalog(host.call('mcpServerStatus/list',{'threadId':host.state.thread},timeout=20))
        result['client_binding']='schema-supported namespace DynamicToolSpec + item/tool/call; unchanged generic boundary'
        result['resource_placements_before_inference']=[outer_placement]+[verify_resource(resource,json.loads((args.out/name).read_text())['unit'],component) for name,component in [('host-process.json','native'),*[(n+'-host-process.json',n) for n in allowed]]]
        result['retained_helper_placements_before_inference']=[]
        for name in ['host-process.json',*[n+'-host-process.json' for n in allowed]]:
            record=json.loads((args.out/name).read_text())
            for key in ('guard_pid','service_runner_pid'):
                result['retained_helper_placements_before_inference'].append(verify_pid_placement(record[key],outer_placement['unit_observation']['ControlGroup']))
            result['retained_helper_placements_before_inference'].append(verify_pid_placement(int(next(r for r in result['resource_placements_before_inference'] if r['unit']==record['unit'])['unit_observation']['MainPID']),resource['slice_cgroup']+'/'+record['unit']))
        if time.monotonic_ns()>=native_stop:raise TimeoutError('original stop before resource admission')
        if args.metadata_only:
            result['outcome']='metadata_pass';result['inference_started']=False
            return result
        goal=host.call('thread/goal/set',{'threadId':host.state.thread,'objective':objective,'status':'active'})
        assert host.state.goal(goal)=='active' and goal['goal']['objective']==objective
        host.state.goal_created_at=goal['goal']['createdAt'];host.state.goal_objective=objective
        host.state.goal_set_ack=True;result['native_goal_set_receipt']=goal
        turn=host.call('turn/start',{'threadId':host.state.thread,'model':MODEL,'effort':EFFORT,
            'input':[{'type':'text','text':body,'text_elements':[]}]})
        host.state.initial_turn=ident(turn['turn']['id']);host.state.initial_turn_ack=True;host.state.maybe_activation()
        while time.monotonic_ns()<native_stop:
            if host.attention or host.state.failed:raise RuntimeError('unadmitted native capability/event')
            if host.state.goal_status=='complete':
                proof=establish_native_complete(host,native_stop)
                if proof:
                    result['native_goal_terminal_receipt']=proof.pop('native_goal_receipt')
                    result['completion_proof']=proof
                    host.state.allowed_tail_interrupts=set(proof['active_turn_ids'])
                    result['outcome']='native_goal_complete';break
            if host.state.goal_status in ('paused','blocked','usageLimited','budgetLimited'):
                raise RuntimeError('native Goal stopped before completion')
            if time.monotonic()-host.last_poll>=1:
                host.state.goal(host.call('thread/goal/get',{'threadId':host.state.thread},timeout=3))
                host.last_poll=time.monotonic();result['metrics']=host.state.metrics();save()
            host.event_signal.wait(.1);host.event_signal.clear()
        else:raise TimeoutError('original native stop reached')
    except Exception as error:
        result['outcome']='HOLD';result['error_class']=type(error).__name__;result['error']=str(error)
    finally:
        if host:
            result['native_goal_status_before_cleanup']=host.state.goal_status
            if args.metadata_only:host.close()
            else:stop_native(host)
            result['metrics']=host.state.metrics()
            result['tail_interruption_receipts']=[r for r in host.state.turn_receipts if r['method']=='turn/completed' and r['turnId'] in host.state.allowed_tail_interrupts]
            if result.get('outcome')=='native_goal_complete' and (host.attention or host.state.adverse_failure_observed or host.state.goal_status!='complete'):
                result['outcome']='HOLD';result['error_class']='RuntimeError';result['error']='adverse native event or changed terminal Goal; completion does not override failure'
            result['goal_receipts']=host.state.goal_receipts;result['turn_receipts']=host.state.turn_receipts
            result['host_rpc_counts']=host.rpc_counts;result['native_event_counts']=host.event_counts
            result['mcp_startup_receipts']=host.mcp_startup_receipts
            result['held_process_exit_code']=host.proc.returncode
            if relay:relay.close()
            result['client_tool_call_receipts']=relay.calls if relay else []
            boundary_proofs={name:json.loads((args.out/(name+'-host-process.json')).read_text()) for name in allowed}
            result['client_tool_cgroups_quiet']=all(p.get('cgroup_absent_or_empty') is True for p in boundary_proofs.values())
            result['client_tool_process_groups_absent']=all(absent(p.get('native_host_pgid')) for p in boundary_proofs.values())
            record=args.out/'host-process.json'
            proof=json.loads(record.read_text()) if record.exists() else {}
            result['native_cgroup_quiet']=proof.get('cgroup_absent_or_empty') is True
            result['held_process_groups_absent']=absent(host.proc.pid) and absent(proof.get('native_host_pgid'))
            try:
                result['execution_unit_receipts']=quiet_executions(args.workspace/'operation_receipts',total_stop)
                result['execution_units_quiet']=all(row['quiet'] for row in result['execution_unit_receipts'])
            except Exception as error:
                result['execution_units_quiet']=False
                result['cleanup_error_class']=type(error).__name__
            try:
                save()  # structural config/identity is available to exact proof reader
                result['owned_scope_proof']=owned_scope_prove(args.out,args.workspace,total_stop,args.resource_profile)
                result['held_owned_processes_quiet']=result['owned_scope_proof']['native_owned_processes_quiet']
                result['client_tool_owned_processes_quiet']=result['owned_scope_proof']['client_tool_owned_processes_quiet']
                result['all_owned_scopes_quiet']=result['owned_scope_proof']['all_owned_scopes_quiet']
            except Exception as error:
                result['all_owned_scopes_quiet']=False
                result['owned_scope_proof_error_class']=type(error).__name__
        if relay and not host:relay.close()
        try:
            result['aggregate_kernel_memory_before_worker_exit']=resource_kernel(resource['slice_cgroup'])
            events=result['aggregate_kernel_memory_before_worker_exit']['memory.events']
            result['resource_oom_observed']=any(int(events.get(k,'0'))>0 for k in ('oom','oom_kill','oom_group_kill'))
        except (OSError,ValueError):result['resource_oom_observed']='UNKNOWN'
        result['elapsed_seconds']=(time.monotonic_ns()-birth_ns)/1e9
        result['closed_before_original_total_stop']=time.monotonic_ns()<total_stop
        result['raw_native_output_persisted_by_driver']=False
        result['mechanical_route_pass']=(result.get('outcome')=='native_goal_complete' and result['resource_oom_observed'] is False and
           result.get('native_cgroup_quiet') and result.get('held_owned_processes_quiet') and
           result.get('execution_units_quiet') and result.get('client_tool_cgroups_quiet') and
           result.get('client_tool_owned_processes_quiet') and result.get('all_owned_scopes_quiet') and result['closed_before_original_total_stop'])
        save()
    return result


def main():
    parser=argparse.ArgumentParser()
    for name in ('workspace','prompt-file','out','auth-source'):parser.add_argument('--'+name,type=Path,required=True)
    parser.add_argument('--label',required=True)
    parser.add_argument('--max-seconds',type=float,required=True)
    parser.add_argument('--birth-monotonic-ns',type=int)
    parser.add_argument('--execution-enabled',action='store_true')
    parser.add_argument('--public-get',action='store_true')
    parser.add_argument('--scored-research',action='store_true')
    parser.add_argument('--metadata-only',action='store_true')
    parser.add_argument('--resource-profile',type=Path,required=True)
    args=parser.parse_args()
    if args.max_seconds<30:parser.error('at least30 seconds including cleanup reserve required')
    result=execute(args)
    print(json.dumps({k:result.get(k) for k in ('label','outcome','thread_id','elapsed_seconds','mechanical_route_pass','error_class','error')},indent=2))
    return 0 if result['mechanical_route_pass'] or args.metadata_only and result.get('outcome')=='metadata_pass' else 126


if __name__=='__main__':raise SystemExit(main())
