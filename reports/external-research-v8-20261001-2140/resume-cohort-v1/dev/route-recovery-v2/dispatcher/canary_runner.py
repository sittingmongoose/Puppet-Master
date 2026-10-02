"""Root-authorized one-shot canary. Public positive projections only."""
import argparse,hashlib,importlib.util,json,os,subprocess,sys,time
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parent))
from dispatcher import ROOT,CAMPAIGN,CANARY,DEADLINE,atomic_json,begin_job,ledger,verify_positive_pins,CONTROL
ASSEMBLY=Path(CONTROL['assembly'])
EXECUTION=Path(CONTROL['execution'])

def load_module(name,path):
    spec=importlib.util.spec_from_file_location(name,path)
    module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module);return module

def sha(path):return hashlib.sha256(Path(path).read_bytes()).hexdigest()

def positive_json(path):
    path=Path(path)
    if any(p.is_symlink() for p in (path,*path.parents)) or path.stat().st_size>4194304:
        raise ValueError('regular bounded positive receipt required')
    return json.loads(path.read_text())

def run(release,original_start_ns,original_birth_epoch,outer_deadline_ns):
    if release.get('caller_version')!='caller-repair2':raise ValueError('fresh root caller2 release required')
    if release['mode']!='CANARY_ONLY':raise ValueError('specific canary root authorization required')
    if os.environ.get('PM_BOUND_DEADLINE_NS')!=str(outer_deadline_ns):
        raise ValueError('original outer prep deadline gate required')
    if type(original_start_ns) is not int or original_start_ns<=0 or original_start_ns>time.monotonic_ns():
        raise ValueError('original preblocking birth required')
    if outer_deadline_ns!=original_start_ns+480*10**9 or time.monotonic_ns()>=outer_deadline_ns:
        raise ValueError('immutable original outer deadline required')
    verify_positive_pins(release)
    request={'job':CANARY,'case':CANARY,'family':'Z','route':release['route'],
        'pins':release['pins'],'component_seconds':480,'component_responses':64,
        'case_wall_seconds':480,'case_occupied_seconds':480,'outside_native_cap_seconds':300,
        'source_access':{'mode':'mechanical-public-example-domain-get-and-byte-range','url':'https://example.com/'},
        'current_stages':['mechanical-native-goal-canary']}
    birth=begin_job(release,request,original_start_ns=original_start_ns,original_birth_epoch=original_birth_epoch)
    home=ROOT/'jobs'/CANARY/CANARY
    ws=home/'workspace';ws.mkdir(mode=0o700)
    (ws/'inputs').mkdir();(ws/'out').mkdir()
    (ws/'TASK.md').write_bytes((ASSEMBLY/'canary/TASK.md').read_bytes())
    (ws/'inputs/ECHO.txt').write_bytes((ASSEMBLY/'canary/ECHO.txt').read_bytes())
    prompt=home/'OBJECTIVE.md';prompt.write_bytes((ASSEMBLY/'canary/OBJECTIVE.md').read_bytes())
    start=birth['stage_start_monotonic_ns']
    stage_id=CANARY
    cutoff=time.monotonic_ns()+int((DEADLINE-time.time())*10**9)
    clock={'case_id':CANARY,'case_start_monotonic_ns':start,'case_elapsed_cap_seconds':480,
        'case_occupied_cap_seconds':480,'outside_native_cap_seconds':300,
        'campaign_native_cutoff_monotonic_ns':cutoff,
        'stages':{stage_id:{'stage_start_monotonic_ns':start,'cap_seconds':480,'response_cap':64}}}
    authority=home/'CASE_AUTHORITY.json';atomic_json(authority,clock)
    authority_record={'path':str(authority),'sha256':sha(authority),'clock':clock}
    deadline=min(start+480*10**9,cutoff);unit='er8-'+stage_id+'.service'
    lease=home/'LEASE.json'
    atomic_json(lease,{'schema':'er8.route.lease.v1','owned_unit':unit,
        'deadline_monotonic_ns':deadline,'native_stop_monotonic_ns':deadline-30*10**9,
        'case_authority':authority_record,'occupied_seconds_reserved':480,'outside_seconds_reserved':300})
    config=release['config'];acceptance=release['route_acceptance'];out=home/'native-public'
    binding=home/'CASE_BINDING.json'
    immutable={str(ws/'TASK.md'):sha(ws/'TASK.md'),str(ws/'inputs/ECHO.txt'):sha(ws/'inputs/ECHO.txt')}
    atomic_json(binding,{'schema':'er8.route.case-binding.v1','case_id':CANARY,
        'case_start_monotonic_ns':start,'stage_id':stage_id,'stage_start_monotonic_ns':start,
        'max_seconds':480,'max_responses':64,'workspace':str(ws),'prompt_file':str(prompt),
        'prompt_sha256':sha(prompt),'native_out':str(out),'label':CANARY,'mode':'canary','public_get':True,
        'immutable_inputs':immutable,'immutable_capture_inputs':{},'config_sha256':config['sha256'],'lease_sha256':sha(lease),
        'account_identity':'existing-authorized-zcode-account-v8-A'})
    assembly_binding={'config':config,'lease':{'path':str(lease),'sha256':sha(lease)},
        'case_binding':{'path':str(binding),'sha256':sha(binding)},'acceptance':acceptance}
    plan_path=home/'PLAN.json'
    make_plan=load_module('er8_make_plan',EXECUTION/'make_plan.py')
    plan=make_plan.construct(stage_id=stage_id,start_ns=start,cap_seconds=480,response_cap=64,
        workspace=str(ws),prompt=str(prompt),native_out=str(out),label=CANARY,admission=str(binding),
        boundary_acceptance=release['execution_acceptance'],plan_path=str(plan_path),public_get=True,
        cleanup_reserve_seconds=30,case_authority=authority_record,v8_stage_role='lifetime-canary',
        route_snapshot=release['route_snapshot'],route_acceptance=acceptance,assembly_binding=assembly_binding)
    atomic_json(plan_path,plan)
    # Actual positive selected source/config files are rehashed again immediately before launch.
    check=verify_positive_pins(release);atomic_json(home/'IMMEDIATE_PRELAUNCH_PINS.json',check)
    for record in (config,acceptance,release['execution_acceptance'],release['route_snapshot']):
        if sha(record['path'])!=record['sha256']:raise RuntimeError('exact launch record drift')
    # Upfront measured host exposure must be admitted before provider-capable launch.
    outside_end=time.monotonic_ns()
    if outside_end-start>=300*10**9 or outside_end>=deadline:
        raise RuntimeError('original pre-wrapper outside/deadline budget exhausted')
    ledger('event',{'case':CANARY,'job':CANARY,'category':'setup',
        'seconds':(outside_end-start)/10**9,'outside_native_seconds':(outside_end-start)/10**9,
        'interval_receipt_id':CANARY+'-outside-before-guard'})
    permit=CANARY+'-permit-1'
    ledger('guard-start',{'job':CANARY,'permit_id':permit})
    after_guard=time.monotonic_ns()
    if after_guard-start>=300*10**9 or after_guard>=deadline:
        ledger('start-absent',{'job':CANARY,'permit_id':permit,'native_activation_absent':True,
            'receipt_id':CANARY+'-no-launch-outside-exhausted'})
        raise RuntimeError('original pre-wrapper budget exhausted during accounting')
    ledger('event',{'case':CANARY,'job':CANARY,'category':'setup',
        'seconds':(after_guard-outside_end)/10**9,'outside_native_seconds':(after_guard-outside_end)/10**9,
        'interval_receipt_id':CANARY+'-outside-guard-accounting'})
    launch_begin=time.monotonic_ns()
    if launch_begin-start>=300*10**9 or launch_begin>=deadline:
        ledger('start-absent',{'job':CANARY,'permit_id':permit,'native_activation_absent':True,
            'receipt_id':CANARY+'-no-launch-final-outside-exhausted'})
        raise RuntimeError('original pre-wrapper budget exhausted before Popen')
    # Wrapper streams are discarded; native-private trees remain closed.
    proc=subprocess.Popen(plan['command'],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    # Reconcile the small event-write interval; this overlaps the running wrapper
    # only in wall time, while its measured segment precedes launch_begin.
    ledger('event',{'case':CANARY,'job':CANARY,'category':'setup',
        'seconds':(launch_begin-after_guard)/10**9,'outside_native_seconds':(launch_begin-after_guard)/10**9,
        'interval_receipt_id':CANARY+'-outside-final-prelaunch-tail'})
    atomic_json(home/'LAUNCHED.json',{'schema':'er8.dispatcher.launch-positive.v1','job':CANARY,
        'launch_begin_monotonic_ns':launch_begin,'owned_unit':unit,'original_deadline_monotonic_ns':deadline})
    started=False
    while proc.poll() is None:
        activation=out/'activation.json'
        if activation.exists() and not started:
            observed=positive_json(activation)
            if observed.get('native_activation_observed') is True:
                ledger('goal-start',{'job':CANARY,'receipt_id':observed['receipt_id'],
                    'epoch':observed['observed_activation_epoch']});started=True
                atomic_json(home/'ACTIVATION_POSITIVE.json',observed)
        time.sleep(0.5)
    observer=load_module('er8_observe',EXECUTION/'observe.py')
    enrollment=Path(plan['enrollment_path'])
    if not enrollment.exists():
        atomic_json(home/'TERMINAL_HOLD.json',{'schema':'er8.dispatcher.terminal-hold.v1',
            'reason':'positive enrollment missing','wrapper_returncode':proc.returncode,
            'native_activation':'observed' if started else 'UNKNOWN','occupancy':'held'})
        return
    quiet=observer.observe(enrollment,unit,deadline)
    atomic_json(home/'QUIESCENCE.json',quiet)
    if not quiet['owned_native_quiescent']:
        atomic_json(home/'TERMINAL_HOLD.json',{'reason':'own cgroup not positively quiet','occupancy':'held'})
        return
    metrics_path=out/'public-metrics.json'
    if not metrics_path.exists():
        atomic_json(home/'TERMINAL_HOLD.json',{'reason':'positive terminal metrics missing',
            'native_activation':'observed' if started else 'UNKNOWN','occupancy':'held'})
        return
    metrics=positive_json(metrics_path);activation=metrics.get('activation',{})
    if not started and activation.get('native_activation_observed') is True:
        ledger('goal-start',{'job':CANARY,'receipt_id':activation['receipt_id'],
            'epoch':activation['observed_activation_epoch']});started=True
    elif not started and activation.get('native_activation_absent_proof') is True:
        ledger('start-absent',{'job':CANARY,'permit_id':permit,'native_activation_absent':True,
            'receipt_id':CANARY+'-positive-no-activation'})
    elif not started:
        atomic_json(home/'TERMINAL_HOLD.json',{'reason':'activation absence UNKNOWN','occupancy':'held'})
        return
    output=metrics.get('usage_totals',{}).get('outputTokens')
    if type(output) is int:ledger('usage',{'job':CANARY,'generated_output_tokens':output})
    adapter=load_module('er8_adapter',ASSEMBLY/'adapter.py')
    export=adapter.export_manifest(ws,CANARY)
    atomic_json(home/'PUBLIC_ARTIFACT_FREEZE.json',export)
    atomic_json(home/'PUBLIC_METRICS_FREEZE.json',{'path':str(metrics_path),'sha256':sha(metrics_path)})
    finish=time.monotonic_ns()
    ledger('event',{'case':CANARY,'job':CANARY,'category':'handoff',
        'seconds':(finish-quiet['quiescence_observed_monotonic_ns'])/10**9,
        'outside_native_seconds':(finish-quiet['quiescence_observed_monotonic_ns'])/10**9,
        'interval_receipt_id':CANARY+'-outside-after-quiet'})
    if metrics.get('host_groups_absent') is not True:
        atomic_json(home/'TERMINAL_HOLD.json',{'reason':'positive host process group absence missing','occupancy':'held'})
        return
    measured_outside=(launch_begin-start+finish-quiet['quiescence_observed_monotonic_ns'])/10**9
    whole_case_hold=(not quiet['inclusive_native_lifetime_established'] or finish>=deadline or measured_outside>=300)
    atomic_json(home/'COMPLETE.json',{'schema':'er8.dispatcher.canary-close.v1',
        'job':CANARY,'wrapper_returncode':proc.returncode,'observed_native_goal':started,
        'lease_release_deferred':True,'lease_released_by_caller':False,
        'external_close_required':True,'caller_version':'caller-repair2',
        'original_case_start_monotonic_ns':start,'original_deadline_monotonic_ns':deadline,
        'native_wrapper_launch_monotonic_ns':launch_begin,
        'native_quiescence_observed_monotonic_ns':quiet['quiescence_observed_monotonic_ns'],
        'caller_observed_end_monotonic_ns':finish,
        'public_metrics_path':str(metrics_path),'artifact_freeze_path':str(home/'PUBLIC_ARTIFACT_FREEZE.json'),
        'quiescence_path':str(home/'QUIESCENCE.json'),'independent_native_qualification':'HOLD' if whole_case_hold else 'PENDING',
        'whole_case_status':'HOLD_LATE_OR_OUTSIDE' if whole_case_hold else 'PENDING_PARENT_CLOSE_PROOF',
        'measured_outside_native_seconds_lower_bound':measured_outside,
        'all_required_host_work_closed':'PENDING_PARENT_CLOSE_PROOF',
        'source_semantic_acquisition':'UNKNOWN','underlying_account_identity':'UNKNOWN',
        'generated_usage':'UNKNOWN except reported monotonic output lower bound'})

def main():
    p=argparse.ArgumentParser();p.add_argument('--root-release',type=Path,required=True)
    p.add_argument('--original-start-ns',type=int,required=True)
    p.add_argument('--original-birth-epoch',type=float,required=True)
    p.add_argument('--outer-deadline-ns',type=int,required=True)
    a=p.parse_args()
    run(json.loads(a.root_release.read_text()),a.original_start_ns,a.original_birth_epoch,a.outer_deadline_ns)
if __name__=='__main__':main()
