"""One root-selected native canary actor. Never releases its own lease."""
import argparse
import subprocess
import sys
import time
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent))
from common import *
from release_binding import check_parent_release,bind_stage


def run(a, tracker):
    armed(a.deadline_ns)
    release=read_json(a.root_release);check_parent_release(release,'canary')
    release['_parent_record']={'path':str(a.root_release),'sha256':sha(a.root_release)}
    case=release['selected_stage_scope']['canary_id'];job=case
    home=Path(a.run_root)/case/job;tracker.update(home=home,case=case,job=job)
    request={'job':job,'case':case,'family':'L','route':release['route'],'pins':release['pins'],
        'component_seconds':480,'component_responses':1,'case_wall_seconds':3600,
        'case_occupied_seconds':5400,'outside_native_cap_seconds':300,
        'source_access':{'mechanical_fixture':True,'public_https_get':['https://example.com/']},
        'current_stages':['lifetime-canary'],'birth_epoch':a.birth_epoch,'birth_monotonic':a.birth_ns/10**9}
    admission=ledger('prepare-admission',request)
    birth={'schema':'er8.luna.original-canary-birth.v1','case':case,'job':job,'stage_epoch':a.birth_epoch,
        'stage_monotonic_ns':a.birth_ns,'original_case_epoch':a.birth_epoch,
        'original_case_monotonic_ns':a.birth_ns,'original_deadline_monotonic_ns':a.deadline_ns,
        'host_anchor_monotonic_ns':a.birth_ns,'admission':admission}
    atomic(home.parent/(job+'.BIRTH.json'),birth)
    cmd=[PYTHON,'-I','-B',str(LUNA_ROUTE/'prepare_canary.py'),'--root',str(home),
        '--source-review',release['source_review']['path'],'--boundary-acceptance',release['execution_acceptance']['path'],
        '--auth-source',release['auth_source_path'],'--case-id',case,
        '--stage-birth-ns',str(a.birth_ns),'--stage-birth-epoch',str(a.birth_epoch),
        '--campaign-cutoff-ns',str(a.campaign_ns)]
    prep=subprocess.run(cmd,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    if prep.returncode!=0:raise ValueError('metadata preparer failed')
    atomic(home/'BIRTH.json',birth)
    binding=read_json(home/'CASE_BINDING.json')
    abi=bind_stage(release,home,binding)
    lease=read_json(home/'LEASE.json');authority=lease['case_authority']
    maker=load('er8_luna_canary_plan',LUNA_ROUTE/'make_plan.py')
    plan=maker.construct(stage_id=binding['stage_id'],start_ns=a.birth_ns,cap_seconds=480,response_cap=1,
        workspace=binding['workspace'],prompt=binding['prompt_file'],native_out=binding['native_out'],label=case,
        admission=str(home/'CASE_BINDING.json'),boundary_acceptance=release['execution_acceptance'],
        plan_path=str(home/'PLAN.json'),public_get=True,cleanup_reserve_seconds=30,case_authority=authority,
        route_snapshot=release['route_snapshot'],route_acceptance=abi['acceptance'],assembly_binding=abi,
        private_auth_binding={'source':release['auth_source_path'],'target':str(home/'private-codex-auth/auth.json')})
    atomic(home/'PLAN.json',plan)
    launch=time.monotonic_ns()
    status=charge(case,job,a.birth_ns,launch,'outside-original-birth-to-guard','setup')
    if launch>=a.deadline_ns-30*10**9 or status['outside_native_seconds_by_case'].get(case,0)>=300:raise ValueError('original preparation allowance exhausted')
    permit=job+'-once-only-permit';ledger('guard-start',{'job':job,'permit_id':permit})
    launch_ns=time.monotonic_ns()
    if launch_ns>=plan['native_stop_monotonic_ns']:raise ValueError('original native stop reached')
    atomic(home/'LAUNCH_INTENT.json',{'original_deadline_monotonic_ns':a.deadline_ns,'native_wrapper_launch_monotonic_ns':launch_ns})
    tracker['Popen_attempted']=True
    proc=subprocess.Popen(plan['command'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    atomic(home/'LAUNCHED.json',{'job':job,'owned_unit':plan['owned_unit'],'wrapper_pid':proc.pid,
        'wrapper_pgid':os.getpgid(proc.pid),'native_wrapper_launch_monotonic_ns':launch_ns,'original_deadline_monotonic_ns':a.deadline_ns})
    charge(case,job,launch,launch_ns,'outside-guard-to-wrapper','setup')
    started=False;out=home/'native-public'
    def activation_if_present():
        nonlocal started
        if (out/'activation.json').is_file() and not started:
            activation=native_json(home,'activation.json')
            if activation.get('native_activation_observed') is True:
                ledger('goal-start',{'job':job,'receipt_id':activation['receipt_id'],'epoch':activation['observed_activation_epoch']});started=True
    while proc.poll() is None:
        activation_if_present();time.sleep(.1)
    rc=proc.wait();activation_if_present()
    atomic(home/'WRAPPER_EXIT.json',{'wrapper_pid':proc.pid,'wrapper_returncode':rc,'wrapper_exit_observed_monotonic_ns':time.monotonic_ns()})
    observer=load('er8_luna_canary_quiet',EXECUTION/'observe.py')
    quiet=observer.observe(plan['enrollment_path'],plan['owned_unit'],a.deadline_ns);atomic(home/'QUIESCENCE.json',quiet)
    if quiet.get('owned_native_quiescent') is not True or quiet.get('inclusive_native_lifetime_established') is not True:raise ValueError('positive native/MCP quiet missing')
    metrics=native_json(home,'public-metrics.json')
    output=metrics.get('usage_totals',{}).get('outputTokens')
    if type(output) is int:ledger('usage',{'job':job,'generated_output_tokens':output})
    if rc!=0 or not started:raise ValueError('native route failed/activation unknown')
    validate_luna_metrics(metrics)
    if metrics.get('host_groups_absent') is not True:raise ValueError('native/MCP process groups not positively quiet')
    artifacts={}
    for name in ('phase1.json','line-map.json','canary.json'):
        path=home/'workspace/out'/name
        if not path.is_file() or path.stat().st_size==0:raise ValueError('canary artifacts missing')
        artifacts[name]={'path':str(path),'sha256':sha(path)}
    atomic(home/'COMPLETE.json',{'schema':'er8.luna.canary-component-complete.v1','case':case,'job':job,
        'stage_start_monotonic_ns':a.birth_ns,'original_deadline_monotonic_ns':a.deadline_ns,
        'lease_release_deferred':True,'lease_released_by_actor':False,'artifacts':artifacts,
        'goal_target_id':metrics['goal_target_id'],'native_response_policy':POLICY,
        'native_goal_complete_observed':True,'independent_canary_qualification':'PENDING'})
    return 0


def main():
    p=argparse.ArgumentParser()
    for n in ('root-release','run-root'):p.add_argument('--'+n,required=True)
    for n in ('birth-ns','campaign-ns','deadline-ns'):p.add_argument('--'+n,type=int,required=True)
    p.add_argument('--birth-epoch',type=float,required=True);a=p.parse_args();tracker={'Popen_attempted':False}
    try:raise SystemExit(run(a,tracker))
    except Exception as e:
        home=tracker.get('home')
        if home and tracker['Popen_attempted'] is False:
            # Source-owned control flow proves no Popen was even attempted.
            atomic(home/'NO_NATIVE_LAUNCH.json',{'wrapper_Popen_attempted':False,'positive_native_activation_absent':True,
                'stage_monotonic_ns':a.birth_ns,'original_deadline_monotonic_ns':a.deadline_ns})
        print(json.dumps({'outcome':'HOLD','error_class':type(e).__name__,'lease':'HELD_PENDING_EXTERNAL_POSITIVE_CLOSURE'}),flush=True)
        raise SystemExit(126)
if __name__=='__main__':main()
